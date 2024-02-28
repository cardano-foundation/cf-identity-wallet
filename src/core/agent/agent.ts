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
  ConnectionService,
  CredentialService,
  IdentifierService,
  MessageService,
} from "./services";
import { documentLoader } from "./documentLoader";
import { SignifyNotificationService } from "./services/signifyNotificationService";
import { PreferencesKeys, PreferencesStorage } from "../storage";

const SERVER_MEDIATOR =
  // eslint-disable-next-line no-undef
  process.env.REACT_APP_SERVER_MEDIATOR ??
  "https://dev.mediator.cf-keripy.metadata.dev.cf-deployments.org";

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
const getMediatorInvitationUrl = async (): Promise<string> => {
  try {
    const mediatorStorage = await PreferencesStorage.get(
      PreferencesKeys.APP_MEDIATOR_INVITATION_URL
    );
    return mediatorStorage?.url as string;
  } catch (error) {
    const getUrl = await fetch(`${SERVER_MEDIATOR}/invitation`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const mediatorInvitationUrl = await getUrl.text();
    await PreferencesStorage.set(PreferencesKeys.APP_MEDIATOR_INVITATION_URL, {
      url: mediatorInvitationUrl,
    });
    return mediatorInvitationUrl;
  }
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
    mediatorInvitationUrl: await getMediatorInvitationUrl(),
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
  private signifyNotificationService!: SignifyNotificationService;

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

  get genericRecords() {
    return this.agent.genericRecords;
  }

  get signifyNotification() {
    if (!this.signifyNotificationService)
      this.signifyNotificationService = new SignifyNotificationService(
        this.agent
      );
    return this.signifyNotificationService;
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
