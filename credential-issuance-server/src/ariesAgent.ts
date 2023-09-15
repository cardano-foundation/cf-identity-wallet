import {
  Agent,
  AutoAcceptCredential,
  ConnectionEventTypes,
  ConnectionRecord,
  ConnectionStateChangedEvent,
  // ConsoleLogger,
  CREDENTIALS_CONTEXT_V1_URL,
  CredentialsModule,
  HttpOutboundTransport,
  InitConfig,
  JsonLdCredentialFormatService,
  KeyType,
  // LogLevel,
  V2CredentialProtocol,
  V2OfferCredentialMessage,
  W3cCredentialsModule,
} from "@aries-framework/core";
import { AskarModule } from "@aries-framework/askar";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";
import { agentDependencies, HttpInboundTransport } from "@aries-framework/node";
import { config } from "./config";
import { Output } from "./types/baseInquirer";

const agentConfig: InitConfig = {
  endpoints: config.endpoints,
  label: "idw-server",
  walletConfig: {
    id: "idw-server",
    key: "idw-server",
  },
  // logger: new ConsoleLogger(LogLevel.info), // Uncomment it to view logs from aries agent
};

class AriesAgent {
  private static instance: AriesAgent;
  private readonly agent: Agent<{
    credentials: CredentialsModule<V2CredentialProtocol<JsonLdCredentialFormatService[]>[]>,
    askar: AskarModule,
    w3cCredentials: W3cCredentialsModule
  }>;

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

  async offerCredential(connectionId: string) {
    const did = await this.agent.dids.create({
      method: "key",
      options: { keyType: KeyType.Ed25519 },
    });
    return this.agent.credentials.offerCredential({
      protocolVersion: "v2",
      connectionId: connectionId,
      credentialFormats: {
        jsonld: {
          credential: {
            "@context": [
              CREDENTIALS_CONTEXT_V1_URL,
              "https://www.w3.org/2018/credentials/examples/v1",
            ],
            type: ["VerifiableCredential", "UniversityDegreeCredential"],
            issuer: did.didState.did as string,
            issuanceDate: "2022-10-22T12:23:48Z",
            credentialSubject: {
              degree: {
                type: "BachelorDegree",
                name: "Bachelor of Science and Arts",
              },
            },
          },
          options: {
            proofType: "Ed25519Signature2018",
            proofPurpose: "assertionMethod",
          },
        },
      },
      autoAcceptCredential: AutoAcceptCredential.Always,
    });
  }

  async createOfferInvitation() {
    const did = await this.agent.dids.create({
      method: "key",
      options: { keyType: KeyType.Ed25519 },
    });
    const { message } = await this.agent.credentials.createOffer({
      comment: "V2 Out of Band offer (W3C)",
      autoAcceptCredential: AutoAcceptCredential.Always,
      credentialFormats: {
        jsonld: {
          credential: {
            "@context": [
              CREDENTIALS_CONTEXT_V1_URL,
              "https://www.w3.org/2018/credentials/examples/v1",
            ],
            type: ["VerifiableCredential", "UniversityDegreeCredential"],
            issuer: did.didState.did as string,
            issuanceDate: "2017-10-22T12:23:48Z",
            credentialSubject: {
              degree: {
                type: "BachelorDegree",
                name: "Bachelor of Science and Arts",
              },
            },
          },
          options: {
            proofType: "Ed25519Signature2018",
            proofPurpose: "assertionMethod",
          },
        },
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

  async waitForConnection(outOfBandId: string) {
    console.log("Waiting for agent to finish connection...");

    const getConnectionRecord = (outOfBandId: string) =>
      new Promise<ConnectionRecord>((resolve, reject) => {
        // Timeout of 60 seconds
        const timeoutId = setTimeout(
          () => reject(new Error(Output.MissingConnectionRecord)),
          60000,
        );

        // Start listener
        this.agent.events.on<ConnectionStateChangedEvent>(
          ConnectionEventTypes.ConnectionStateChanged,
          (e) => {
            if (e.payload.connectionRecord.outOfBandId !== outOfBandId) return;

            clearTimeout(timeoutId);
            resolve(e.payload.connectionRecord);
          },
        );

        // Also retrieve the connection record by invitation if the event has already fired
        void this.agent.connections
          .findAllByOutOfBandId(outOfBandId)
          .then(([connectionRecord]) => {
            if (connectionRecord) {
              clearTimeout(timeoutId);
              resolve(connectionRecord);
            }
          });
      });
    try {
      const connectionRecord = await getConnectionRecord(outOfBandId);
      await this.agent.connections.returnWhenIsConnected(connectionRecord.id, {
        timeoutMs: 60000,
      });
    } catch (e) {
      console.log(
        "\nTimeout of 60 seconds reached.. Returning to home screen.\n",
      );
      return;
    }
    console.log(Output.ConnectionEstablished);
  }

  async connectionFindAllByOutOfBandId(
    outOfBandId: string,
  ): Promise<ConnectionRecord[]> {
    return this.agent.connections.findAllByOutOfBandId(outOfBandId);
  }
}

export {
  AriesAgent,
};