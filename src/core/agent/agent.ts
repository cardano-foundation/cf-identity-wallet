import { Capacitor } from "@capacitor/core";
import {
  ConnectionService,
  CredentialService,
  IdentifierService,
  SingleSigService,
} from "./services";
import { SignifyNotificationService } from "./services/signifyNotificationService";
import { StorageApi } from "../storage/storage.types";
import { SqliteStorage } from "../storage/sqliteStorage";
import { IonicStorage } from "../storage/ionicStorage";
import { AgentServicesProps } from "./agent.types";
import {
  randomPasscode,
  SignifyClient,
  ready as signifyReady,
  Tier,
} from "signify-ts";
import { EventService } from "./services/eventService";
import { CredentialStorage, IdentifierStorage } from "./records";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { KeyStoreKeys } from "../storage";
import { MultiSigService } from "./services/multiSigService";
import { IpexCommunicationService } from "./services/ipexCommunicationService";

const config = {
  label: "idw-agent",
  walletConfig: {
    id: "idw",
    key: "idw", // Right now, this key isn't used as we don't have encryption.
  },
  autoUpdateStorageOnStartup: true,
};
class Agent {
  static readonly LOCAL_KERIA_ENDPOINT =
    "https://dev.keria.cf-keripy.metadata.dev.cf-deployments.org";
  static readonly LOCAL_KERIA_BOOT_ENDPOINT =
    "https://dev.keria-boot.cf-keripy.metadata.dev.cf-deployments.org";

  private static instance: Agent;
  private agentServicesProps: AgentServicesProps;

  private basicRecordStorage!: StorageApi;
  private signifyClient!: SignifyClient;
  static ready = false;

  // @TODO - foconnor: Registering these should be more generic, but OK for now
  private identifierService!: IdentifierService;
  private singleSigService!: SingleSigService;
  private multiSigService!: MultiSigService;
  private ipexCommunicationService!: IpexCommunicationService;

  private connectionService!: ConnectionService;
  private credentialService!: CredentialService;
  private signifyNotificationService!: SignifyNotificationService;

  get identifiers() {
    if (!this.identifierService) {
      this.identifierService = new IdentifierService(this.agentServicesProps);
    }
    return this.identifierService;
  }

  get singleSigs() {
    if (!this.singleSigService) {
      this.singleSigService = new SingleSigService(this.agentServicesProps);
    }
    return this.singleSigService;
  }

  get multiSigs() {
    if (!this.multiSigService) {
      this.multiSigService = new MultiSigService(this.agentServicesProps);
    }
    return this.multiSigService;
  }

  get ipexCommunications() {
    if (!this.ipexCommunicationService) {
      this.ipexCommunicationService = new IpexCommunicationService(
        this.agentServicesProps
      );
    }
    return this.ipexCommunicationService;
  }

  get connections() {
    if (!this.connectionService) {
      this.connectionService = new ConnectionService(this.agentServicesProps);
    }
    return this.connectionService;
  }

  get credentials() {
    if (!this.credentialService) {
      this.credentialService = new CredentialService(this.agentServicesProps);
    }
    return this.credentialService;
  }

  get basicStorages() {
    return this.basicRecordStorage;
  }

  get signifyNotifications() {
    if (!this.signifyNotificationService) {
      this.signifyNotificationService = new SignifyNotificationService(
        this.agentServicesProps
      );
    }
    return this.signifyNotificationService;
  }

  private constructor() {
    this.basicRecordStorage = Capacitor.isNativePlatform()
      ? new SqliteStorage()
      : new IonicStorage();
    this.agentServicesProps = {
      basicStorage: this.basicRecordStorage,
      signifyClient: this.signifyClient,
      eventService: new EventService(),
      identifierStorage: new IdentifierStorage(this.basicRecordStorage),
      credentialStorage: new CredentialStorage(this.basicRecordStorage),
    };
  }

  static get agent() {
    if (!this.instance) {
      this.instance = new Agent();
    }
    return this.instance;
  }

  async start(): Promise<void> {
    if (!Agent.ready) {
      await this.basicRecordStorage.open(config.walletConfig?.id || "idw");
      await signifyReady();
      const bran = await this.getBran();
      // @TODO - foconnor: Review of Tier level.
      this.signifyClient = new SignifyClient(
        Agent.LOCAL_KERIA_ENDPOINT,
        bran,
        Tier.low,
        Agent.LOCAL_KERIA_BOOT_ENDPOINT
      );
      try {
        await this.signifyClient.connect();
      } catch (err) {
        await this.signifyClient.boot();
        await this.signifyClient.connect();
      }
      Agent.ready = true;
    }
  }

  private async getBran(): Promise<string> {
    let bran;
    try {
      bran = await SecureStorage.get(KeyStoreKeys.SIGNIFY_BRAN);
    } catch (error) {
      bran = randomPasscode();
      await SecureStorage.set(KeyStoreKeys.SIGNIFY_BRAN, bran);
    }
    return bran as string;
  }
}

export { Agent };
