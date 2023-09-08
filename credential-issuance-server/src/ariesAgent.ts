import {
  Agent,
  AutoAcceptCredential,
  ConsoleLogger,
  CREDENTIALS_CONTEXT_V1_URL,
  CredentialsModule,
  HttpOutboundTransport,
  InitConfig,
  JsonLdCredentialFormatService,
  KeyType,
  LogLevel,
  V2CredentialProtocol,
  W3cCredentialsModule
} from "@aries-framework/core";
import {AskarModule} from "@aries-framework/askar";
import {ariesAskar} from "@hyperledger/aries-askar-nodejs";
import {agentDependencies, HttpInboundTransport} from "@aries-framework/node";
import {config} from "./config";

const agentConfig: InitConfig = {
  endpoints: config.endpoints,
  label: "idw-server",
  walletConfig: {
    id: "idw-server",
    key: "idw-server",
  },
  logger: new ConsoleLogger(LogLevel.info),
};

export class AriesAgent {
  private static instance: AriesAgent;
  private readonly agent: Agent;
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
    const { outOfBandInvitation } = await this.agent.oob.createInvitation({
      autoAcceptConnection: true,
      multiUseInvitation: true,
    });
    return outOfBandInvitation.toUrl({ domain: config.endpoint });
  }

  async getConnection(connectionId: string) {
    try {
      return await this.agent.connections.getById(connectionId);
    }
    catch (e) {
      return null;
    }
  }
  
  async offerCredential(connectionId: string) {
    const did = await this.agent.dids.create({
      method: "key",
      options: { keyType: KeyType.Ed25519 },
    });
    return this.agent.credentials.offerCredential({
      protocolVersion: "v2" as never,
      connectionId: connectionId,
      credentialFormats: {
        jsonld: {
          credential: {
            "@context": [CREDENTIALS_CONTEXT_V1_URL, "https://www.w3.org/2018/credentials/examples/v1"],
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

}