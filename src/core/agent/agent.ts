import { Capacitor } from "@capacitor/core";
import {
  randomPasscode,
  SignifyClient,
  ready as signifyReady,
  Tier,
} from "signify-ts";
import { Storage } from "@ionic/storage";
import {
  ConnectionService,
  CredentialService,
  IdentifierService,
} from "./services";
import { SignifyNotificationService } from "./services/signifyNotificationService";
import { AgentServicesProps } from "./agent.types";
import { EventService } from "./services/eventService";
import {
  BasicRecord,
  BasicStorage,
  CredentialMetadataRecord,
  CredentialStorage,
  IdentifierMetadataRecord,
  IdentifierStorage,
} from "./records";
import { KeyStoreKeys, SecureStorage } from "../storage";
import { MultiSigService } from "./services/multiSigService";
import { IpexCommunicationService } from "./services/ipexCommunicationService";
import { SqliteSession } from "../storage/sqliteStorage/sqliteSession";
import { IonicSession } from "../storage/ionicStorage/ionicSession";
import { IonicStorage } from "../storage/ionicStorage";
import { SqliteStorage } from "../storage/sqliteStorage";
import { BaseRecord } from "../storage/storage.types";

const walletId = "idw";
class Agent {
  static readonly LOCAL_KERIA_ENDPOINT =
    "https://dev.keria.cf-keripy.metadata.dev.cf-deployments.org";
  static readonly LOCAL_KERIA_BOOT_ENDPOINT =
    "https://dev.keria-boot.cf-keripy.metadata.dev.cf-deployments.org";

  private static instance: Agent;
  private agentServicesProps!: AgentServicesProps;

  private storageSession!: SqliteSession | IonicSession;

  private basicStorage!: BasicStorage;
  private signifyClient!: SignifyClient;
  static ready = false;

  // @TODO - foconnor: Registering these should be more generic, but OK for now
  private identifierService!: IdentifierService;
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
    return this.basicStorage;
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
    this.storageSession = Capacitor.isNativePlatform()
      ? new SqliteSession()
      : new IonicSession();
  }

  static get agent() {
    if (!this.instance) {
      this.instance = new Agent();
    }
    return this.instance;
  }

  async start(): Promise<void> {
    if (!Agent.ready) {
      await this.storageSession.open(walletId);
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
      this.basicStorage = new BasicStorage(
        this.getStorageService<BasicRecord>(this.storageSession)
      );
      this.agentServicesProps = {
        basicStorage: this.basicStorage,
        signifyClient: this.signifyClient,
        eventService: new EventService(),
        identifierStorage: new IdentifierStorage(
          this.getStorageService<IdentifierMetadataRecord>(this.storageSession)
        ),
        credentialStorage: new CredentialStorage(
          this.getStorageService<CredentialMetadataRecord>(this.storageSession)
        ),
      };
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

  private getStorageService<T extends BaseRecord>(
    instance: IonicSession | SqliteSession
  ) {
    if (instance instanceof IonicSession) {
      return new IonicStorage<T>(instance.session!);
    }
    return new SqliteStorage<T>(instance.session!);
  }
}

export { Agent };
