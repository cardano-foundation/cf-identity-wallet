import {
  InitConfig,
  Agent,
  AgentDependencies,
  DidsModule,
  KeyDidResolver,
  MediationRecipientModule,
  MediatorPickupStrategy,
  KeyDidRegistrar,
  WsOutboundTransport,
  CredentialsModule,
  V2CredentialProtocol,
  JsonLdCredentialFormatService,
  AutoAcceptCredential,
  W3cCredentialsModule,
} from "@aries-framework/core";
import { EventEmitter } from "events";
import { Capacitor } from "@capacitor/core";
import { CapacitorFileSystem } from "./dependencies";
import { IonicStorageModule, GeneralStorageModule } from "./modules";
import { HttpOutboundTransport } from "./transports";
import { SignifyModule } from "./modules/signify";
import { SqliteStorageModule } from "./modules/sqliteStorage";
import {
  CryptoService,
  ConnectionService,
  CredentialService,
  IdentifierService,
  MessageService,
} from "./services";
import { documentLoader } from "./documentLoader";

const config: InitConfig = {
  label: "idw-agent",
  walletConfig: {
    id: "idw",
    key: "idw", // Right now, this key isn't used as we don't have encryption.
  },
  autoUpdateStorageOnStartup: true,
};

const agentDependencies: AgentDependencies = {
  FileSystem: CapacitorFileSystem,
  EventEmitterClass: EventEmitter,
  // eslint-disable-next-line no-undef
  fetch: global.fetch as unknown as AgentDependencies["fetch"],
  WebSocketClass:
    // eslint-disable-next-line no-undef
    global.WebSocket as unknown as AgentDependencies["WebSocketClass"],
};

const agentModules = {
  generalStorage: new GeneralStorageModule(),
  dids: new DidsModule({
    registrars: [new KeyDidRegistrar()],
    resolvers: [new KeyDidResolver()],
  }),
  ...(Capacitor.isNativePlatform()
    ? { sqliteStorage: new SqliteStorageModule() }
    : { ionicStorage: new IonicStorageModule() }),
  signify: new SignifyModule(),
  mediationRecipient: new MediationRecipientModule({
    mediatorInvitationUrl:
      "http://dev.mediator.cf-keripy.metadata.dev.cf-deployments.org:2015/invitation?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiIzY2E3NjhhYS1kNWUyLTRiMGYtYjIwOC0yNGNiMjMxZTdhNTgiLCJsYWJlbCI6IkFyaWVzIEZyYW1ld29yayBKYXZhU2NyaXB0IE1lZGlhdG9yIiwiYWNjZXB0IjpbImRpZGNvbW0vYWlwMSIsImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXSwiaGFuZHNoYWtlX3Byb3RvY29scyI6WyJodHRwczovL2RpZGNvbW0ub3JnL2RpZGV4Y2hhbmdlLzEuMCIsImh0dHBzOi8vZGlkY29tbS5vcmcvY29ubmVjdGlvbnMvMS4wIl0sInNlcnZpY2VzIjpbeyJpZCI6IiNpbmxpbmUtMCIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHA6Ly9kZXYubWVkaWF0b3IuY2Yta2VyaXB5Lm1ldGFkYXRhLmRldi5jZi1kZXBsb3ltZW50cy5vcmc6MjAxNSIsInR5cGUiOiJkaWQtY29tbXVuaWNhdGlvbiIsInJlY2lwaWVudEtleXMiOlsiZGlkOmtleTp6Nk1rdmk1RG1nbTg2Q1FUM3JveDZ2dExZNzN0RUZzVkVjSkRYdXNSWDRZdDloczQiXSwicm91dGluZ0tleXMiOltdfSx7ImlkIjoiI2lubGluZS0xIiwic2VydmljZUVuZHBvaW50Ijoid3M6Ly9kZXYubWVkaWF0b3IuY2Yta2VyaXB5Lm1ldGFkYXRhLmRldi5jZi1kZXBsb3ltZW50cy5vcmc6MjAxNSIsInR5cGUiOiJkaWQtY29tbXVuaWNhdGlvbiIsInJlY2lwaWVudEtleXMiOlsiZGlkOmtleTp6Nk1rdmk1RG1nbTg2Q1FUM3JveDZ2dExZNzN0RUZzVkVjSkRYdXNSWDRZdDloczQiXSwicm91dGluZ0tleXMiOltdfV19",
    mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
  }),
  credentials: new CredentialsModule({
    credentialProtocols: [
      new V2CredentialProtocol({
        credentialFormats: [new JsonLdCredentialFormatService()],
      }),
    ],
    autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
  }),
  w3cCredentials: new W3cCredentialsModule({
    documentLoader: documentLoader,
  }),
};

class AriesAgent {
  private static instance: AriesAgent;
  private readonly agent!: Agent<typeof agentModules>;
  static ready = false;

  // @TODO - foconnor: Registering these should be more generic, but OK for now
  private identifierService!: IdentifierService;
  private connectionService!: ConnectionService;
  private messageService!: MessageService;
  private credentialService!: CredentialService;
  private cryptoService!: CryptoService;

  get identifiers() {
    if (!this.identifierService)
      this.identifierService = new IdentifierService(this.agent);
    return this.identifierService;
  }

  get connections() {
    if (!this.connectionService)
      this.connectionService = new ConnectionService(this.agent);
    return this.connectionService;
  }

  get messages() {
    if (!this.messageService)
      this.messageService = new MessageService(this.agent);
    return this.messageService;
  }

  get credentials() {
    if (!this.credentialService)
      this.credentialService = new CredentialService(this.agent);
    return this.credentialService;
  }

  get crypto() {
    if (!this.cryptoService) this.cryptoService = new CryptoService(this.agent);
    return this.cryptoService;
  }

  get genericRecords() {
    return this.agent.genericRecords;
  }

  private constructor() {
    this.agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: agentModules,
    });
    this.agent.registerOutboundTransport(new HttpOutboundTransport());
    this.agent.registerOutboundTransport(new WsOutboundTransport());
  }

  static get agent() {
    if (!this.instance) {
      this.instance = new AriesAgent();
    }
    return this.instance;
  }

  async start(): Promise<void> {
    if (!AriesAgent.ready) {
      await this.agent.initialize();
      await this.agent.modules.signify.start();
      AriesAgent.ready = true;
    }
  }
}

export { AriesAgent, agentDependencies, agentModules };
