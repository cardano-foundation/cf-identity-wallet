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
import { SignifyNotificationService } from "./services/signifyNotificationService";
import {
  AgentServicesProps,
  BranAndMnemonic,
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
  IpexMessageStorage,
  IpexMessageRecord,
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

const walletId = "idw";
class Agent {
  static readonly KERIA_CONNECTION_BROKEN =
    "The app is not connected to KERIA at the moment";
  static readonly KERIA_BOOT_FAILED = "Failed to boot signify client";
  static readonly KERIA_BOOTED_ALREADY_BUT_CANNOT_CONNECT =
    "Signify client is already booted but cannot connect";
  static readonly KERIA_NOT_BOOTED =
    "Agent has not been booted for a given Signify passcode";
  static readonly INVALID_MNEMONIC = "Seed phrase is invalid";

  private static instance: Agent;
  private agentServicesProps: AgentServicesProps = {
    eventService: undefined as any,
    signifyClient: undefined as any,
  };

  private storageSession!: SqliteSession | IonicSession;

  private basicStorageService!: BasicStorage;
  private identifierStorage!: IdentifierStorage;
  private credentialStorage!: CredentialStorage;
  private connectionStorage!: ConnectionStorage;
  private connectionNoteStorage!: ConnectionNoteStorage;
  private notificationStorage!: NotificationStorage;
  private peerConnectionStorage!: PeerConnectionStorage;
  private ipexMessageStorage!: IpexMessageStorage;
  private operationPendingStorage!: OperationPendingStorage;

  private signifyClient!: SignifyClient;

  // @TODO - foconnor: Registering these should be more generic, but OK for now
  private identifierService!: IdentifierService;
  private multiSigService!: MultiSigService;
  private ipexCommunicationService!: IpexCommunicationService;

  private connectionService!: ConnectionService;
  private credentialService!: CredentialService;
  private signifyNotificationService!: SignifyNotificationService;
  private authService!: AuthService;
  static isOnline = false;

  get identifiers() {
    if (!this.identifierService) {
      this.identifierService = new IdentifierService(
        this.agentServicesProps,
        this.identifierStorage,
        this.operationPendingStorage
      );
    }
    return this.identifierService;
  }

  get multiSigs() {
    if (!this.multiSigService) {
      this.multiSigService = new MultiSigService(
        this.agentServicesProps,
        this.identifierStorage,
        this.notificationStorage,
        this.operationPendingStorage
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
        this.ipexMessageStorage,
        this.operationPendingStorage
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
        this.credentialStorage,
        this.ipexMessageStorage,
        this.operationPendingStorage
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
        this.notificationStorage,
        this.identifierStorage,
        this.operationPendingStorage,
        this.connectionStorage,
        this.ipexMessageStorage
      );
    }
    return this.signifyNotificationService;
  }

  get auth() {
    if (!this.authService) {
      this.authService = new AuthService(this.agentServicesProps);
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
    this.agentServicesProps.eventService.on(
      KeriaStatusEventTypes.KeriaStatusChanged,
      async (event: KeriaStatusChangedEvent) => {
        callback(event);
      }
    );
  }

  async start(keriaConnectUrl: string): Promise<void> {
    if (!Agent.isOnline) {
      await signifyReady();
      const bran = await this.getBran();
      this.signifyClient = new SignifyClient(keriaConnectUrl, bran, Tier.low);
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
        /* eslint-disable no-console */
        console.error(e);
        throw new Error(Agent.KERIA_BOOT_FAILED);
      }
      try {
        await this.signifyClient.connect();
      } catch (e) {
        /* eslint-disable no-console */
        console.error(e);
        throw new Error(Agent.KERIA_BOOTED_ALREADY_BUT_CANNOT_CONNECT);
      }
      await this.saveAgentUrls(agentUrls);
      this.markAgentOnline();
    }
  }

  async recoverKeriaAgent(
    seedPhrase: string[],
    connectUrl: string
  ): Promise<void> {
    let bran = "";
    try {
      const mnemonic = seedPhrase.join(" ");
      bran = Buffer.from(mnemonicToEntropy(mnemonic), "hex")
        .toString("utf-8")
        .replace(/\0/g, "");

      this.signifyClient = new SignifyClient(connectUrl, bran, Tier.low);

      await this.signifyClient.connect();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid mnemonic") {
          throw new Error(Agent.INVALID_MNEMONIC);
        }
        if (error.message.includes("agent does not exist for controller")) {
          throw new Error(Agent.KERIA_NOT_BOOTED);
        }
        throw error;
      }
    }

    await SecureStorage.set(KeyStoreKeys.SIGNIFY_BRAN, bran);
    await this.saveAgentUrls({
      url: connectUrl,
      bootUrl: "",
    });

    this.markAgentOnline();
  }

  private markAgentOnline() {
    Agent.isOnline = true;
    this.agentServicesProps.signifyClient = this.signifyClient;
    this.agentServicesProps.eventService.emit<KeriaStatusChangedEvent>({
      type: KeriaStatusEventTypes.KeriaStatusChanged,
      payload: {
        isOnline: Agent.isOnline,
      },
    });
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
    this.operationPendingStorage = new OperationPendingStorage(
      this.getStorageService<OperationPendingRecord>(this.storageSession)
    );
    this.ipexMessageStorage = new IpexMessageStorage(
      this.getStorageService<IpexMessageRecord>(this.storageSession)
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
      Buffer.alloc(3),
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
