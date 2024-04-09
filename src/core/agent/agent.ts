import { Capacitor } from "@capacitor/core";
import {
  ConnectionService,
  CredentialService,
  IdentifierService,
} from "./services";
import { SignifyNotificationService } from "./services/signifyNotificationService";
import { StorageApi } from "../storage/storage.types";
import { SqliteStorage } from "../storage/sqliteStorage";
import { IonicStorage } from "../storage/ionicStorage";
import { SignifyApi } from "./modules/signify/signifyApi";

const config = {
  label: "idw-agent",
  walletConfig: {
    id: "idw",
    key: "idw", // Right now, this key isn't used as we don't have encryption.
  },
  autoUpdateStorageOnStartup: true,
};
class Agent {
  private static instance: Agent;
  private basicRecordStorage!: StorageApi;
  private signifyApi!: SignifyApi;
  static ready = false;

  // @TODO - foconnor: Registering these should be more generic, but OK for now
  private identifierService!: IdentifierService;
  private connectionService!: ConnectionService;
  private credentialService!: CredentialService;
  private signifyNotificationService!: SignifyNotificationService;

  get identifiers() {
    if (!this.identifierService) {
      this.identifierService = new IdentifierService(
        this.basicRecordStorage,
        this.signifyApi
      );
    }
    return this.identifierService;
  }

  get connections() {
    if (!this.connectionService) {
      this.connectionService = new ConnectionService(
        this.basicRecordStorage,
        this.signifyApi
      );
    }
    return this.connectionService;
  }

  get credentials() {
    if (!this.credentialService) {
      this.credentialService = new CredentialService(
        this.basicRecordStorage,
        this.signifyApi
      );
    }
    return this.credentialService;
  }

  get basicStorages() {
    return this.basicRecordStorage;
  }

  get signifyNotifications() {
    if (!this.signifyNotificationService) {
      this.signifyNotificationService = new SignifyNotificationService(
        this.basicRecordStorage,
        this.signifyApi
      );
    }
    return this.signifyNotificationService;
  }

  private constructor() {
    this.basicRecordStorage = Capacitor.isNativePlatform()
      ? new SqliteStorage()
      : new IonicStorage();
    this.signifyApi = new SignifyApi();
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
      await this.signifyApi.start();
      Agent.ready = true;
    }
  }
}

export { Agent };
