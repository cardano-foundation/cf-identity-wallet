import { Capacitor } from "@capacitor/core";
import {
  randomPasscode,
  SignifyClient,
  ready as signifyReady,
  Tier,
} from "signify-ts";
import { DataType } from "@aparajita/capacitor-secure-storage";
import {
  ConnectionService,
  CredentialService,
  IdentifierService,
} from "./services";
import { SignifyNotificationService } from "./services/signifyNotificationService";
import {
  AgentServicesProps,
  KeriaStatusChangedEvent,
  KeriaStatusEventTypes,
  AgentUrls,
  MiscRecordId,
} from "./agent.types";
import { EventService } from "./services/eventService";
import {
  BasicRecord,
  BasicStorage,
  ConnectionNoteRecord,
  ConnectionNoteStorage,
  ConnectionRecord,
  ConnectionStorage,
  CredentialMetadataRecord,
  CredentialStorage,
  IdentifierMetadataRecord,
  IdentifierStorage,
  PeerConnectionMetadataRecord,
  PeerConnectionStorage,
  NotificationRecord,
  NotificationStorage,
} from "./records";
import { KeyStoreKeys, SecureStorage } from "../storage";
import { MultiSigService } from "./services/multiSigService";
import { IpexCommunicationService } from "./services/ipexCommunicationService";
import { SqliteSession } from "../storage/sqliteStorage/sqliteSession";
import { IonicSession } from "../storage/ionicStorage/ionicSession";
import { IonicStorage } from "../storage/ionicStorage";
import { SqliteStorage } from "../storage/sqliteStorage";
import { BaseRecord } from "../storage/storage.types";
import { ConfigurationService } from "../configuration";

const walletId = "idw";
class Agent {
  static readonly KERIA_CONNECTION_BROKEN =
    "The app is not connected to KERIA at the moment";
  static readonly KERIA_BOOT_FAILED = "Failed to boot signify client";
  static readonly KERIA_BOOTED_ALREADY_BUT_CANNOT_CONNECT =
    "Signify client is already booted but cannot connect";
  static readonly KERI_CONNECTION_URL_NOT_SET = "Keria url is not set";

  private static instance: Agent;
  private agentServicesProps!: AgentServicesProps;

  private storageSession!: SqliteSession | IonicSession;

  private basicStorageService!: BasicStorage;
  private identifierStorage!: IdentifierStorage;
  private credentialStorage!: CredentialStorage;
  private connectionStorage!: ConnectionStorage;
  private connectionNoteStorage!: ConnectionNoteStorage;
  private notificationStorage!: NotificationStorage;
  private peerConnectionStorage!: PeerConnectionStorage;

  private signifyClient!: SignifyClient;

  // @TODO - foconnor: Registering these should be more generic, but OK for now
  private identifierService!: IdentifierService;
  private multiSigService!: MultiSigService;
  private ipexCommunicationService!: IpexCommunicationService;

  private connectionService!: ConnectionService;
  private credentialService!: CredentialService;
  private signifyNotificationService!: SignifyNotificationService;
  static isOnline = false;

  get identifiers() {
    if (!this.identifierService) {
      this.identifierService = new IdentifierService(
        this.agentServicesProps,
        this.identifierStorage
      );
    }
    return this.identifierService;
  }

  get multiSigs() {
    if (!this.multiSigService) {
      this.multiSigService = new MultiSigService(
        this.agentServicesProps,
        this.identifierStorage,
        this.notificationStorage
      );
    }
    return this.multiSigService;
  }

  get ipexCommunications() {
    if (!this.ipexCommunicationService) {
      this.ipexCommunicationService = new IpexCommunicationService(
        this.agentServicesProps,
        this.identifierStorage,
        this.credentialStorage,
        this.notificationStorage
      );
    }
    return this.ipexCommunicationService;
  }

  get connections() {
    if (!this.connectionService) {
      this.connectionService = new ConnectionService(
        this.agentServicesProps,
        this.connectionStorage,
        this.connectionNoteStorage,
        this.credentialStorage
      );
    }
    return this.connectionService;
  }

  get credentials() {
    if (!this.credentialService) {
      this.credentialService = new CredentialService(
        this.agentServicesProps,
        this.credentialStorage,
        this.notificationStorage
      );
    }
    return this.credentialService;
  }

  get peerConnectionMetadataStorage() {
    return this.peerConnectionStorage;
  }

  get basicStorage() {
    return this.basicStorageService;
  }

  get signifyNotifications() {
    if (!this.signifyNotificationService) {
      this.signifyNotificationService = new SignifyNotificationService(
        this.agentServicesProps,
        this.notificationStorage
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

  onKeriaStatusStateChanged(
    callback: (event: KeriaStatusChangedEvent) => void
  ) {
    this.agentServicesProps.eventService.on(
      KeriaStatusEventTypes.KeriaStatusChanged,
      async (event: KeriaStatusChangedEvent) => {
        callback(event);
      }
    );
  }

  async start(keriUrl?: string): Promise<void> {
    if (!Agent.isOnline) {
      const exitsUrls = await this.getAgentUrls();
      if (!keriUrl && !exitsUrls.url) {
        throw new Error(Agent.KERI_CONNECTION_URL_NOT_SET);
      }
      await signifyReady();
      const bran = await this.getBran();
      this.signifyClient = new SignifyClient(
        (keriUrl ? keriUrl : exitsUrls.url) as string,
        bran,
        Tier.low
      );
      await this.signifyClient.connect();
      Agent.isOnline = true;
      this.agentServicesProps.signifyClient = this.signifyClient;
      this.agentServicesProps.eventService.emit<KeriaStatusChangedEvent>({
        type: KeriaStatusEventTypes.KeriaStatusChanged,
        payload: {
          isOnline: Agent.isOnline,
        },
      });
    }
  }

  async bootAndConnect(agentUrls: AgentUrls): Promise<void> {
    if (!Agent.isOnline) {
      await signifyReady();
      const bran = await this.getBran();
      this.signifyClient = new SignifyClient(
        agentUrls.url,
        bran,
        Tier.low,
        agentUrls.bootUrl
      );
      try {
        await this.signifyClient.boot();
      } catch (e) {
        throw new Error(Agent.KERIA_BOOT_FAILED);
      }
      try {
        await this.signifyClient.connect();
      } catch (e) {
        throw new Error(Agent.KERIA_BOOTED_ALREADY_BUT_CANNOT_CONNECT);
      }
      await this.saveAgentUrls(agentUrls);
      Agent.isOnline = true;
      this.agentServicesProps.signifyClient = this.signifyClient;
      this.agentServicesProps.eventService.emit<KeriaStatusChangedEvent>({
        type: KeriaStatusEventTypes.KeriaStatusChanged,
        payload: {
          isOnline: Agent.isOnline,
        },
      });
    }
  }

  async getAgentUrls(): Promise<Partial<AgentUrls>> {
    const keriUrlRecord = await this.basicStorageService.findById(
      MiscRecordId.KERIA_CONNECT_URL
    );
    const keriBootUrlRecord = await this.basicStorageService.findById(
      MiscRecordId.KERI_BOOT_URL
    );
    if (!keriUrlRecord || !keriBootUrlRecord) {
      return {
        url: undefined,
        bootUrl: undefined,
      };
    }
    return {
      url: keriUrlRecord.content.url as string,
      bootUrl: keriBootUrlRecord.content.url as string,
    };
  }
  async getDefaultAgentUrls(): Promise<Partial<AgentUrls>> {
    return {
      url: ConfigurationService.env.keri.keria?.url,
      bootUrl: ConfigurationService.env.keri.keria?.bootUrl,
    };
  }

  async saveAgentUrls(agentUrls: AgentUrls): Promise<void> {
    await this.basicStorageService.save({
      id: MiscRecordId.KERIA_CONNECT_URL,
      content: {
        url: agentUrls.url,
      },
    });
    await this.basicStorageService.save({
      id: MiscRecordId.KERI_BOOT_URL,
      content: {
        url: agentUrls.bootUrl,
      },
    });
  }

  async initDatabaseConnection(): Promise<void> {
    await this.storageSession.open(walletId);
    this.basicStorageService = new BasicStorage(
      this.getStorageService<BasicRecord>(this.storageSession)
    );
    this.identifierStorage = new IdentifierStorage(
      this.getStorageService<IdentifierMetadataRecord>(this.storageSession)
    );
    this.credentialStorage = new CredentialStorage(
      this.getStorageService<CredentialMetadataRecord>(this.storageSession)
    );
    this.connectionStorage = new ConnectionStorage(
      this.getStorageService<ConnectionRecord>(this.storageSession)
    );
    this.connectionNoteStorage = new ConnectionNoteStorage(
      this.getStorageService<ConnectionNoteRecord>(this.storageSession)
    );
    this.notificationStorage = new NotificationStorage(
      this.getStorageService<NotificationRecord>(this.storageSession)
    );
    this.peerConnectionStorage = new PeerConnectionStorage(
      this.getStorageService<PeerConnectionMetadataRecord>(this.storageSession)
    );

    this.agentServicesProps = {
      signifyClient: this.signifyClient,
      eventService: new EventService(),
    };
  }

  async connect(retryInterval = 1000) {
    try {
      if (Agent.isOnline) {
        Agent.isOnline = false;
        this.agentServicesProps.eventService.emit<KeriaStatusChangedEvent>({
          type: KeriaStatusEventTypes.KeriaStatusChanged,
          payload: {
            isOnline: false,
          },
        });
      }
      await this.signifyClient.connect();
      Agent.isOnline = true;
      this.agentServicesProps.eventService.emit<KeriaStatusChangedEvent>({
        type: KeriaStatusEventTypes.KeriaStatusChanged,
        payload: {
          isOnline: true,
        },
      });
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
      await this.connect(retryInterval);
    }
  }

  getKeriaOnlineStatus(): boolean {
    return Agent.isOnline;
  }

  private async getBran(): Promise<string> {
    let bran: DataType | null;
    try {
      bran = await SecureStorage.get(KeyStoreKeys.SIGNIFY_BRAN);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          `${SecureStorage.KEY_NOT_FOUND} ${KeyStoreKeys.SIGNIFY_BRAN}`
      ) {
        bran = randomPasscode();
        await SecureStorage.set(KeyStoreKeys.SIGNIFY_BRAN, bran);
      } else {
        throw error;
      }
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
