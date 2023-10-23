import {
  Agent,
  AutoAcceptCredential,
  // ConsoleLogger,
  CREDENTIALS_CONTEXT_V1_URL,
  CredentialsModule,
  HttpOutboundTransport,
  InitConfig,
  JsonLdCredentialDetailFormat,
  JsonLdCredentialFormatService,
  KeyType,
  // LogLevel,
  V2CredentialProtocol,
  V2OfferCredentialMessage,
  W3cCredentialsModule,
} from "@aries-framework/core";
import { AskarModule } from "@aries-framework/askar";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";
import { HttpInboundTransport, agentDependencies } from "@aries-framework/node";
import { config } from "./config";

const agentConfig: InitConfig = {
  endpoints: config.endpoints,
  label: "Credential Issuance Service",
  walletConfig: {
    id: "idw-server",
    key: "idw-server",
  },
  // logger: new ConsoleLogger(LogLevel.info), // Uncomment it to view logs from aries agent
};

class AriesAgent {
  private static instance: AriesAgent;
  private readonly agent: Agent<{
    credentials: CredentialsModule<
      V2CredentialProtocol<JsonLdCredentialFormatService[]>[]
    >;
    askar: AskarModule;
    w3cCredentials: W3cCredentialsModule;
  }>;

  private masterDid;

  private constructor() {
    this.agent = new Agent({
      config: agentConfig,
      dependencies: agentDependencies,
      modules: {
        // Register the Askar module on the agent
        askar: new AskarModule({
          ariesAskar,
        }),
        credentials: new CredentialsModule({
          credentialProtocols: [
            new V2CredentialProtocol({
              credentialFormats: [new JsonLdCredentialFormatService()],
            }),
          ],
          autoAcceptCredentials: AutoAcceptCredential.Always,
        }),
        w3cCredentials: new W3cCredentialsModule(),
      },
    });
    const httpOutboundTransport = new HttpOutboundTransport();
    this.agent.registerOutboundTransport(httpOutboundTransport);
  }

  static get agent() {
    if (!this.instance) {
      this.instance = new AriesAgent();
    }
    return this.instance;
  }

  async start(httpInboundTransport: HttpInboundTransport): Promise<void> {
    this.agent.registerInboundTransport(httpInboundTransport);
    await this.agent.initialize();
    this.masterDid = await this.agent.dids.create({
      method: "key",
      options: { keyType: KeyType.Ed25519 },
    });
  }

  async createInvitation() {
    const { id: outOfBandId, outOfBandInvitation } =
      await this.agent.oob.createInvitation({
        autoAcceptConnection: true,
        multiUseInvitation: true,
      });
    return {
      outOfBandId,
      url: outOfBandInvitation.toUrl({ domain: config.endpoint }),
    };
  }

  async getConnection(connectionId: string) {
    try {
      return await this.agent.connections.getById(connectionId);
    } catch (e) {
      return null;
    }
  }

  async getConnectionByDidOfInvitee(did: string) {
    try {
      const connection = await this.agent.connections.findAllByQuery({
        theirDid: did,
      });
      // get first record
      return connection?.[0];
    } catch (e) {
      return null;
    }
  }

  getCredentialExample(did: string): JsonLdCredentialDetailFormat {
    return {
      credential: {
        "@context": [
          CREDENTIALS_CONTEXT_V1_URL,
          "https://www.w3.org/2018/credentials/examples/v1",
        ],
        type: ["VerifiableCredential", "UniversityDegreeCredential"],
        issuer: did,
        issuanceDate: "2022-10-22T12:23:48Z",
        credentialSubject: {
          // @TODO: handle later, it should be did of holder
          id: "did:example:abcdef1234567",
          type: "BachelorDegree",
          name: "Bachelor of Science and Arts",
        },
        expirationDate: "2100-10-22T12:23:48Z",
      },
      options: {
        proofType: "Ed25519Signature2018",
        proofPurpose: "assertionMethod",
      },
    };
  }
  getCredential(
    credential: JsonLdCredentialDetailFormat["credential"]
  ): JsonLdCredentialDetailFormat {
    return {
      credential: {
        ...credential,
        issuer: this.masterDid.didState.did as string,
        issuanceDate: new Date().toISOString(),
      },
      options: {
        proofType: "Ed25519Signature2018",
        proofPurpose: "assertionMethod",
      },
    };
  }

  async offerCredential(connectionId: string) {
    return this.agent.credentials.offerCredential({
      protocolVersion: "v2",
      connectionId: connectionId,
      credentialFormats: {
        jsonld: this.getCredentialExample(
          this.masterDid.didState.did as string
        ),
      },
      autoAcceptCredential: AutoAcceptCredential.Always,
    });
  }

  async createInvitationWithCredential(
    credential?: JsonLdCredentialDetailFormat["credential"]
  ) {
    const { message } = await this.agent.credentials.createOffer({
      comment: "V2 Out of Band offer (W3C)",
      autoAcceptCredential: AutoAcceptCredential.Always,
      credentialFormats: {
        jsonld: credential
          ? this.getCredential(credential)
          : this.getCredentialExample(this.masterDid.didState.did as string),
      },
      protocolVersion: "v2",
    });
    const offerMessage = message as V2OfferCredentialMessage;
    const { outOfBandInvitation } = await this.agent.oob.createInvitation({
      autoAcceptConnection: true,
      messages: [offerMessage],
    });
    return outOfBandInvitation.toUrl({ domain: config.endpoint });
  }

  async createInvitationWithCredentialConnectionless(
    credential?: JsonLdCredentialDetailFormat["credential"]
  ) {
    const { message, credentialRecord } =
      await this.agent.credentials.createOffer({
        comment: "V2 Out of Band offer (W3C)",
        autoAcceptCredential: AutoAcceptCredential.Always,
        credentialFormats: {
          jsonld: credential
            ? this.getCredential(credential)
            : this.getCredentialExample(this.masterDid.didState.did as string),
        },
        protocolVersion: "v2",
      });
    const offerMessage = message as V2OfferCredentialMessage;
    // @TODO: change when update latest aries framework, use createInvitation function instead (maybe use handshake = false)
    const { invitationUrl } =
      await this.agent.oob.createLegacyConnectionlessInvitation({
        recordId: credentialRecord.id,
        message: offerMessage,
        domain: config.endpoint,
      });
    return invitationUrl;
  }
}

export { AriesAgent };
