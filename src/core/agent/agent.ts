import { Capacitor } from "@capacitor/core";
import {
  randomPasscode,
  SignifyClient,
  ready as signifyReady,
  Tier,
} from "signify-ts";
import { entropyToMnemonic, mnemonicToEntropy } from "bip39";
import {
  AuthService,
  ConnectionService,
  CredentialService,
  IdentifierService,
} from "./services";
import { KeriaNotificationService } from "./services/keriaNotificationService";
import {
  AgentServicesProps,
  BranAndMnemonic,
  AgentUrls,
  MiscRecordId,
} from "./agent.types";
import { CoreEventEmitter } from "./event";
import {
  BasicRecord,
  BasicStorage,
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
import { OperationPendingStorage } from "./records/operationPendingStorage";
import { OperationPendingRecord } from "./records/operationPendingRecord";
import { EventTypes, KeriaStatusChangedEvent } from "./event.types";

const walletId = "idw";
class Agent {
  static readonly KERIA_CONNECTION_BROKEN =
    "The app is not connected to KERIA at the moment";
  static readonly KERIA_BOOT_FAILED_BAD_NETWORK =
    "Failed to boot due to network connectivity";
  static readonly KERIA_CONNECT_FAILED_BAD_NETWORK =
    "Failed to connect due to network connectivity";
  static readonly KERIA_BOOT_FAILED = "Failed to boot signify client";
  static readonly KERIA_BOOTED_ALREADY_BUT_CANNOT_CONNECT =
    "KERIA agent is already booted but cannot connect";
  static readonly KERIA_NOT_BOOTED =
    "Agent has not been booted for a given Signify passcode";
  static readonly INVALID_MNEMONIC = "Seed phrase is invalid";
  static readonly MISSING_DATA_ON_KERIA =
    "Attempted to fetch data by ID on KERIA, but was not found. May indicate stale data records in the local database.";
  static readonly BUFFER_ALLOC_SIZE = 3;

  private static instance: Agent;
  private agentServicesProps: AgentServicesProps = {
    eventEmitter: undefined as any,
    signifyClient: undefined as any,
  };

  private storageSession!: SqliteSession | IonicSession;

  private basicStorageService!: BasicStorage;
  private identifierStorage!: IdentifierStorage;
  private credentialStorage!: CredentialStorage;
  private connectionStorage!: ConnectionStorage;
  private notificationStorage!: NotificationStorage;
  private peerConnectionStorage!: PeerConnectionStorage;
  private operationPendingStorage!: OperationPendingStorage;

  private signifyClient!: SignifyClient;

  // @TODO - foconnor: Registering these should be more generic, but OK for now
  private identifierService!: IdentifierService;
  private multiSigService!: MultiSigService;
  private ipexCommunicationService!: IpexCommunicationService;
  private connectionService!: ConnectionService;
  private credentialService!: CredentialService;
  private keriaNotificationService!: KeriaNotificationService;
  private authService!: AuthService;

  static isOnline = false;

  get identifiers() {
    if (!this.identifierService) {
      this.identifierService = new IdentifierService(
        this.agentServicesProps,
        this.identifierStorage,
        this.operationPendingStorage,
        this.connections,
        this.basicStorage
      );
    }
    return this.identifierService;
  }

  get multiSigs() {
    if (!this.multiSigService) {
      this.multiSigService = new MultiSigService(
        this.agentServicesProps,
        this.identifierStorage,
        this.operationPendingStorage,
        this.notificationStorage,
        this.connections,
        this.identifierService
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
        this.notificationStorage,
        this.operationPendingStorage,
        this.multiSigs,
        this.connections
      );
    }
    return this.ipexCommunicationService;
  }

  get connections() {
    if (!this.connectionService) {
      this.connectionService = new ConnectionService(
        this.agentServicesProps,
        this.connectionStorage,
        this.credentialStorage,
        this.operationPendingStorage,
        this.identifierStorage
      );
    }
    return this.connectionService;
  }

  get credentials() {
    if (!this.credentialService) {
      this.credentialService = new CredentialService(
        this.agentServicesProps,
        this.credentialStorage,
        this.notificationStorage,
        this.identifierStorage
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

  get keriaNotifications() {
    if (!this.keriaNotificationService) {
      this.keriaNotificationService = new KeriaNotificationService(
        this.agentServicesProps,
        this.notificationStorage,
        this.identifierStorage,
        this.operationPendingStorage,
        this.connectionStorage,
        this.credentialStorage,
        this.basicStorage,
        this.multiSigs,
        this.ipexCommunications,
        this.credentialService,
        this.getKeriaOnlineStatus,
        this.markAgentStatus,
        this.connect
      );
    }
    return this.keriaNotificationService;
  }

  get auth() {
    if (!this.authService) {
      this.authService = new AuthService(
        this.agentServicesProps,
        this.basicStorage
      );
    }
    return this.authService;
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
    this.agentServicesProps.eventEmitter.on(
      EventTypes.KeriaStatusChanged,
      callback
    );
  }

  async start(keriaConnectUrl: string): Promise<void> {
    if (!Agent.isOnline) {
      await signifyReady();
      const bran = await this.getBran();
      this.signifyClient = new SignifyClient(keriaConnectUrl, bran, Tier.low);
      this.agentServicesProps.signifyClient = this.signifyClient;
      await this.connectSignifyClient();
      this.markAgentStatus(true);
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
      this.agentServicesProps.signifyClient = this.signifyClient;
      const bootResult = await this.signifyClient.boot().catch((e) => {
        /* eslint-disable no-console */
        console.error(e);
        if (e.message === "Failed to fetch") {
          throw new Error(Agent.KERIA_BOOT_FAILED_BAD_NETWORK, {
            cause: e,
          });
        }
        throw new Error(Agent.KERIA_BOOT_FAILED, {
          cause: e,
        });
      });

      if (!bootResult.ok && bootResult.status !== 409) {
        /* eslint-disable no-console */
        console.warn(
          `Unexpected KERIA boot status returned: ${bootResult.status} ${bootResult.statusText}`
        );
        throw new Error(Agent.KERIA_BOOT_FAILED);
      }

      await this.connectSignifyClient();
      await this.saveAgentUrls(agentUrls);
      this.markAgentStatus(true);
    }
  }

  async recoverKeriaAgent(
    seedPhrase: string[],
    connectUrl: string
  ): Promise<void> {
    const mnemonic = seedPhrase.join(" ");
    let bran = "";
    try {
      const entropy = mnemonicToEntropy(mnemonic);
      const branBuffer = Buffer.from(entropy, "hex").slice(
        0,
        -Agent.BUFFER_ALLOC_SIZE
      );

      bran = branBuffer.toString("utf-8");
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid mnemonic") {
        throw new Error(Agent.INVALID_MNEMONIC, {
          cause: error,
        });
      }
      throw error;
    }

    this.signifyClient = new SignifyClient(connectUrl, bran, Tier.low);
    this.agentServicesProps.signifyClient = this.signifyClient;
    await this.connectSignifyClient();

    await this.basicStorage.save({
      id: MiscRecordId.CLOUD_RECOVERY_STATUS,
      content: { syncing: true },
    });

    await SecureStorage.set(KeyStoreKeys.SIGNIFY_BRAN, bran);
    await this.saveAgentUrls({
      url: connectUrl,
      bootUrl: "",
    });

    await this.syncWithKeria();
  }

  async syncWithKeria() {
    this.markAgentStatus(true);
    await this.connections.syncKeriaContacts();
    await this.identifiers.syncKeriaIdentifiers();
    await this.credentials.syncACDCs();

    await this.basicStorage.update(
      new BasicRecord({
        id: MiscRecordId.CLOUD_RECOVERY_STATUS,
        content: { syncing: false },
      })
    );
  }

  private async connectSignifyClient(): Promise<void> {
    await this.signifyClient.connect().catch((error) => {
      if (!(error instanceof Error)) {
        throw error;
      }
      /* eslint-disable no-console */
      console.error(error);
      const status = error.message.split(" - ")[1];
      if (error.message === "Failed to fetch") {
        throw new Error(Agent.KERIA_CONNECT_FAILED_BAD_NETWORK, {
          cause: error,
        });
      }
      if (/404/gi.test(status)) {
        throw new Error(Agent.KERIA_NOT_BOOTED, {
          cause: error,
        });
      }
      throw new Error(Agent.KERIA_BOOTED_ALREADY_BUT_CANNOT_CONNECT, {
        cause: error,
      });
    });
  }

  markAgentStatus(online: boolean) {
    Agent.isOnline = online;

    if (online) {
      this.connections.removeConnectionsPendingDeletion();
      this.connections.resolvePendingConnections();
      this.identifiers.removeIdentifiersPendingDeletion();
      this.identifiers.resolvePendingIdentifiers();
    }

    this.agentServicesProps.eventEmitter.emit<KeriaStatusChangedEvent>({
      type: EventTypes.KeriaStatusChanged,
      payload: {
        isOnline: online,
      },
    });
  }

  async devPreload() {
    const APP_PASSSCODE_DEV_MODE = "111111";
    try {
      await SecureStorage.get(KeyStoreKeys.APP_PASSCODE);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          `${SecureStorage.KEY_NOT_FOUND} ${KeyStoreKeys.APP_PASSCODE}`
      ) {
        await SecureStorage.set(
          KeyStoreKeys.APP_PASSCODE,
          APP_PASSSCODE_DEV_MODE
        );
      } else {
        throw error;
      }
    }

    try {
      await SecureStorage.get(KeyStoreKeys.SIGNIFY_BRAN);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          `${SecureStorage.KEY_NOT_FOUND} ${KeyStoreKeys.SIGNIFY_BRAN}`
      ) {
        await SecureStorage.set(
          KeyStoreKeys.SIGNIFY_BRAN,
          randomPasscode().substring(0, 21)
        );
      } else {
        throw error;
      }
    }

    await this.basicStorage.createOrUpdateBasicRecord(
      new BasicRecord({
        id: MiscRecordId.APP_ALREADY_INIT,
        content: {
          initialized: true,
        },
      })
    );

    await this.basicStorage.createOrUpdateBasicRecord(
      new BasicRecord({
        id: MiscRecordId.APP_PASSWORD_SKIPPED,
        content: { value: true },
      })
    );
  }

  private async saveAgentUrls(agentUrls: AgentUrls): Promise<void> {
    if (agentUrls.url) {
      await this.basicStorageService.save({
        id: MiscRecordId.KERIA_CONNECT_URL,
        content: {
          url: agentUrls.url,
        },
      });
    }
    if (agentUrls.bootUrl) {
      await this.basicStorageService.save({
        id: MiscRecordId.KERIA_BOOT_URL,
        content: {
          url: agentUrls.bootUrl,
        },
      });
    }
  }

  async setupLocalDependencies(): Promise<void> {
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
    this.notificationStorage = new NotificationStorage(
      this.getStorageService<NotificationRecord>(this.storageSession)
    );
    this.peerConnectionStorage = new PeerConnectionStorage(
      this.getStorageService<PeerConnectionMetadataRecord>(this.storageSession)
    );
    this.operationPendingStorage = new OperationPendingStorage(
      this.getStorageService<OperationPendingRecord>(this.storageSession)
    );
    this.agentServicesProps = {
      signifyClient: this.signifyClient,
      eventEmitter: new CoreEventEmitter(),
    };
    this.connections.onConnectionRemoved();
    this.connections.onConnectionAdded();
    this.identifiers.onIdentifierRemoved();
  }

  async connect(retryInterval = 1000) {
    try {
      if (Agent.isOnline) {
        Agent.isOnline = false;
        this.agentServicesProps.eventEmitter.emit<KeriaStatusChangedEvent>({
          type: EventTypes.KeriaStatusChanged,
          payload: {
            isOnline: false,
          },
        });
      }
      await this.signifyClient.connect();
      Agent.isOnline = true;
      this.agentServicesProps.eventEmitter.emit<KeriaStatusChangedEvent>({
        type: EventTypes.KeriaStatusChanged,
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
    return (await SecureStorage.get(KeyStoreKeys.SIGNIFY_BRAN)) as string;
  }

  private getStorageService<T extends BaseRecord>(
    instance: IonicSession | SqliteSession
  ) {
    if (instance instanceof IonicSession) {
      return new IonicStorage<T>(instance.session!);
    }
    return new SqliteStorage<T>(instance.session!);
  }

  getBranAndMnemonic(): BranAndMnemonic {
    // This converts the 21 character Signify-TS passcode/bran to a BIP-39 compatible word list.
    // The passcode is assumed as UTF-8 in our recovery. In actuality, it is the qb64 CESR salt without the code.
    // We believe it's easier to encode it as UTF-8 in case there is a change in Signify TS in how the passcode is handled.
    const bran = randomPasscode().substring(0, 21);
    return { bran, mnemonic: this.convertToMnemonic(bran) };
  }

  async getMnemonic(): Promise<string> {
    return this.convertToMnemonic(await this.getBran());
  }

  private convertToMnemonic(bran: string): string {
    // This converts the 21 character Signify-TS passcode/bran to a BIP-39 compatible word list.
    // The passcode is assumed as UTF-8 in our recovery. In actuality, it is the qb64 CESR salt without the code.
    // We believe it's easier to encode it as UTF-8 in case there is a change in Signify TS in how the passcode is handled.
    const passcodeBytes = Buffer.concat([
      Buffer.from(bran, "utf-8"),
      Buffer.alloc(Agent.BUFFER_ALLOC_SIZE),
    ]);
    return entropyToMnemonic(passcodeBytes);
  }

  async isMnemonicValid(mnemonic: string): Promise<boolean> {
    try {
      Buffer.from(mnemonicToEntropy(mnemonic), "hex")
        .toString("utf-8")
        .replace(/\0/g, "");
      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid mnemonic") {
          return false;
        }
      }
      throw error;
    }
  }
}

export { Agent };
