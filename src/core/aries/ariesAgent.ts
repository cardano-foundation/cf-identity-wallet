import {
  InitConfig,
  Agent,
  AgentDependencies,
  RecordNotFoundError,
  DidsModule,
  KeyDidResolver,
  KeyType,
  DidRecord,
  OutOfBandRecord,
  ConnectionRecord,
  ConnectionEventTypes,
  ConnectionStateChangedEvent,
  DidExchangeRole,
  DidExchangeState,
  CredentialEventTypes,
  CredentialStateChangedEvent,
  CredentialState,
  CredentialExchangeRecord, KeyDidRegistrar,
} from "@aries-framework/core";
import { EventEmitter } from "events";
import { Capacitor } from "@capacitor/core";
import { CapacitorFileSystem } from "./dependencies";
import {
  IonicStorageModule,
  GeneralStorageModule,
  MiscRecord,
  MiscRecordId,
  CryptoAccountRecord,
} from "./modules";
import { HttpOutboundTransport } from "./transports";
import { GetIdentityResult, IdentityType, UpdateIdentityMetadata } from "./ariesAgent.types";
import type { DIDDetails, IdentityShortDetails } from "./ariesAgent.types";
import { NetworkType } from "../cardano/addresses.types";
import { SignifyModule } from "./modules/signify";
import { SqliteStorageModule } from "./modules/sqliteStorage";
import { LibP2p } from "./transports/libp2p/libP2p";
import {LibP2pOutboundTransport} from "./transports/libP2pOutboundTransport";
import {
  IdentityMetadataRecord,
  IdentityMetadataRecordProps
} from "./modules/generalStorage/repositories/identityMetadataRecord";

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
  fetch: global.fetch as unknown as AgentDependencies["fetch"],
  WebSocketClass:
    global.WebSocket as unknown as AgentDependencies["WebSocketClass"],
};

class AriesAgent {
  static readonly DID_MISSING_METHOD = "DID method missing for stored DID";
  static readonly DID_MISSING_DISPLAY_NAME =
    "DID display name missing for stored DID";
  static readonly DID_MISSING_DID_DOC =
    "DID document missing or unresolvable for stored DID";
  static readonly UNEXPECTED_DID_DOC_FORMAT =
    "DID document format is missing expected values for stored DID";
  static readonly NOT_FOUND_DOMAIN_CONFIG_ERROR_MSG =
    "No domain found in config";
  static readonly DID_MISSING_METADATA_ERROR_MSG =
    "DID metadata missing for stored DID";
  static readonly UNEXPECTED_MISSING_DID_RESULT_ON_CREATE =
    "DID was successfully created but the DID was not returned in the state returned";
  static readonly DID_NOT_ARCHIVED =
    "DID was not archived";

  private static instance: AriesAgent;
  private readonly agent: Agent;
  static ready = false;

  private constructor() {
    const platformIsNative = Capacitor.isNativePlatform();
    this.agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        generalStorage: new GeneralStorageModule(),
        dids: new DidsModule({
          registrars: [new KeyDidRegistrar()],
          resolvers: [new KeyDidResolver()],
        }),
        ...(platformIsNative
          ? { sqliteStorage: new SqliteStorageModule() }
          : { ionicStorage: new IonicStorageModule() }),
        signify: new SignifyModule()
      },
    });
    this.agent.registerOutboundTransport(new HttpOutboundTransport());
  }

  async registerLibP2pInbound(libP2p: LibP2p) {
    const inBoundTransport = libP2p.inBoundTransport;
    await inBoundTransport.start(this.agent);
    this.agent.registerInboundTransport(inBoundTransport);
  }

  async registerLibP2pOutbound(libP2p: LibP2p) {
    const outBoundTransport = new LibP2pOutboundTransport(libP2p);
    await outBoundTransport.start(this.agent);
    this.agent.registerOutboundTransport(outBoundTransport);
  }

  static get agent() {
    if (!this.instance) {
      this.instance = new AriesAgent();
    }
    return this.instance;
  }

  async start(): Promise<void> {
    await this.agent.initialize();
    await this.agent.modules.signify.start();
    // @TODO - uncomment for demo, can remove if not used
    // await AriesAgent.agent.registerLibP2pInbound(LibP2p.libP2p);
    // await AriesAgent.agent.registerLibP2pOutbound(LibP2p.libP2p);
    AriesAgent.ready = true;
  }

  /**
   * Create an invitation link to connect
   */
  async createNewWebRtcInvitation ()  {
    const domains = this.agent.config.endpoints;
    const libP2pDomain = domains.find((domain) => domain.includes("libp2p"));
    if (!libP2pDomain) {
      throw new Error(AriesAgent.NOT_FOUND_DOMAIN_CONFIG_ERROR_MSG);
    }
    const createInvitation = await  this.agent.oob.createInvitation({
      autoAcceptConnection: false,
    });

    return createInvitation.outOfBandInvitation.toUrl({
      domain: libP2pDomain,
    })
  }

  async sendMessageByOutOfBandId(outOfBandId: string, message: string) {
    const [connection] = await this.agent.connections.findAllByOutOfBandId(outOfBandId);
    if (!connection) {
      throw Error("Connection not found");
    }
    return this.agent.basicMessages.sendMessage(connection.id, message);
  }

  async sendMessageByConnectionId(connectionId: string, message: string) {
    const connectionRecord = await this.agent.connections.getById(connectionId);
    if (!connectionRecord) {
      throw Error("Connection not found");
    }
    return  this.agent.basicMessages.sendMessage(connectionRecord.id, message);
  }

  async receiveInvitationFromUrl(url: string): Promise<{
    outOfBandRecord: OutOfBandRecord;
    connectionRecord?: ConnectionRecord | undefined
  }> {
    return this.agent.oob.receiveInvitationFromUrl(url, {
      autoAcceptConnection: true,
      autoAcceptInvitation: true,
      reuseConnection: true,
    });
  }

  /**
   * Lister event connection state change.
   * @param callback 
   */
  onConnectionStateChange(callback: (event: ConnectionStateChangedEvent) => void) {
    this.agent.events.on(ConnectionEventTypes.ConnectionStateChanged, async (event: ConnectionStateChangedEvent) => {
      callback(event);
    })
  }

  /**
   * Lister event request connection.
   * @param callback 
   */
  onRequestConnection(callback: (event: ConnectionRecord) => void) {
    this.agent.events.on(ConnectionEventTypes.ConnectionStateChanged, async (event: ConnectionStateChangedEvent) => {
      if (
        event.payload.connectionRecord.role === DidExchangeRole.Responder &&
        event.payload.connectionRecord.state === DidExchangeState.RequestReceived
      ) {
        callback(event.payload.connectionRecord);
      }
    })
  }

  /**
   * Lister event offer received.
   * @param callback 
   */
  onCredentialOfferReceived(callback: (event: CredentialExchangeRecord) => void) {
    this.agent.events.on(CredentialEventTypes.CredentialStateChanged, async (event: CredentialStateChangedEvent) => {
      if (event.payload.credentialRecord.state === CredentialState.OfferReceived) {
        callback(event.payload.credentialRecord);
      }
    })
  }

  async acceptCredentialOffer(credentialRecordId: string){
    await this.agent.credentials.acceptOffer({ credentialRecordId});
  }
  
  async acceptRequest(connectionId: string){
    await this.agent.connections.acceptRequest(connectionId);
  }

  async storeMiscRecord(id: MiscRecordId, value: string) {
    await this.agent.modules.generalStorage.saveMiscRecord(
      new MiscRecord({ id, value })
    );
  }

  async getMiscRecordValueById(id: MiscRecordId): Promise<string | undefined> {
    try {
      return (await this.agent.modules.generalStorage.getMiscRecordById(id))
        .value;
    } catch (e) {
      if (e instanceof RecordNotFoundError) {
        return undefined;
      }
      throw e;
    }
  }

  async storeCryptoAccountRecord(
    id: string,
    addresses: Map<NetworkType, Map<number, Map<number, string[]>>>,
    rewardAddresses: Map<NetworkType, string[]>,
    displayName: string,
    usesIdentitySeedPhrase = false
  ): Promise<void> {
    await this.agent.modules.generalStorage.saveCryptoRecord(
      new CryptoAccountRecord({
        id,
        addresses,
        rewardAddresses,
        displayName,
        usesIdentitySeedPhrase,
      })
    );
  }

  async cryptoAccountIdentitySeedPhraseExists(): Promise<boolean> {
    return this.agent.modules.generalStorage.cryptoAccountIdentitySeedPhraseExists();
  }

  async removeCryptoAccountRecordById(id: string): Promise<void> {
    await this.agent.modules.generalStorage.removeCryptoRecordById(id);
  }
  async createIdentityMetadataRecord(data: IdentityMetadataRecordProps){
    const dataCreate= {
      id: data.id,
      displayName: data.displayName,
      colors: data.colors,
      method: data.method,
      signifyName: data.signifyName,
    }
    const record = new IdentityMetadataRecord(dataCreate);
    return this.agent.modules.generalStorage.saveIdentityMetadataRecord(record);
  }

  async createIdentity(
    metadata: Omit<IdentityMetadataRecordProps, "id" | "createdAt" | "isArchived">
  ): Promise<string | undefined> {
    const type = metadata.method;
    if (type === IdentityType.KERI) {
      const { signifyName, identifier } = await this.agent.modules.signify.createIdentifier();
      await this.createIdentityMetadataRecord({id: identifier, ...metadata, signifyName: signifyName});
      return identifier;
    }
    const result = await this.agent.dids.create({
      method: type,
      options: { keyType: KeyType.Ed25519 },
    });
    if(!result.didState.did){
      throw new Error(AriesAgent.UNEXPECTED_MISSING_DID_RESULT_ON_CREATE);
    }
    await this.createIdentityMetadataRecord({ id: result.didState.did, ...metadata});
    return result.didState.did;
  }

  async getMetadataById(id: string): Promise<IdentityMetadataRecord> {
    const metadata = await this.agent.modules.generalStorage.getIdentityMetadata(id);
    if (!metadata) {
      throw new Error(`${AriesAgent.DID_MISSING_METADATA_ERROR_MSG} ${id}`);
    }
    return metadata;
  }

  async getIdentities(isGetArchive = false): Promise<IdentityShortDetails[]> {
    const identities: IdentityShortDetails[] = [];
    let listMetadata: IdentityMetadataRecord[];
    if (isGetArchive) {
      listMetadata = await this.agent.modules.generalStorage.getAllArchiveIdentityMetadata();
    } else {
      listMetadata = await this.agent.modules.generalStorage.getAllAvailableIdentityMetadata();
    }
    for (let i = 0; i < listMetadata.length; i++) {
      const metadata = listMetadata[i];
      identities.push({
        method: metadata.method,
        displayName: metadata.displayName,
        id: metadata.id,
        createdAtUTC: metadata.createdAt.toISOString(),
        colors: metadata.colors,
      });
    }
    return identities;
  }

  private isDidIdentifier(identifier: string): boolean {
    return identifier.startsWith("did:");
  }

  async getIdentity(identifier: string): Promise<GetIdentityResult | undefined> {
    if (this.isDidIdentifier(identifier)) {
      const storedDid = await this.agent.dids.getCreatedDids({ did: identifier });
      if (!(storedDid && storedDid.length)) {
        return undefined;
      }

      const method = <IdentityType>storedDid[0].getTag("method")?.toString();
      if (!method) {
        throw new Error(`${AriesAgent.DID_MISSING_METHOD} ${identifier}`);
      }
      if (method === IdentityType.KEY) {
        return {
          type: IdentityType.KEY,
          result: await this.getIdentityFromDidKeyRecord(storedDid[0])
        };
      }
    } else {
      const metadata = await this.getMetadataById(identifier);
      const aid = await this.agent.modules.signify.getIdentifierByName(metadata.signifyName as string);
      if (!aid) {
        return undefined;
      }
      return {
        type: IdentityType.KERI,
        result: {
          id: aid.prefix,
          method: IdentityType.KERI,
          displayName: metadata.displayName,
          createdAtUTC: metadata.createdAt.toISOString(),
          colors: metadata.colors,
          sequenceNumber: aid.state.s,
          priorEventSaid: aid.state.p,
          eventSaid: aid.state.d,
          eventTimestamp: aid.state.dt,
          eventType: aid.state.et,
          keySigningThreshold: aid.state.kt,
          signingKeys: aid.state.k,
          nextKeysThreshold: aid.state.nt,
          nextKeys: aid.state.n,
          backerThreshold: aid.state.bt,
          backerAids: aid.state.b,
          lastEstablishmentEvent: {
            said: aid.state.ee.d,
            sequence: aid.state.ee.s,
            backerToAdd: aid.state.ee.ba,
            backerToRemove: aid.state.ee.br,
          },
        }
      }
    }
  }

  private async getIdentityFromDidKeyRecord(
    record: DidRecord
  ): Promise<DIDDetails> {
    const didDoc = (await this.agent.dids.resolve(record.did)).didDocument;
    if (!didDoc) {
      throw new Error(`${AriesAgent.DID_MISSING_DID_DOC} ${record.did}`);
    }

    if (!(didDoc.verificationMethod && didDoc.verificationMethod.length)) {
      throw new Error(`${AriesAgent.UNEXPECTED_DID_DOC_FORMAT} ${record.did}`);
    }
    const signingKey = didDoc.verificationMethod[0];
    if (!signingKey.publicKeyBase58) {
      throw new Error(`${AriesAgent.UNEXPECTED_DID_DOC_FORMAT} ${record.did}`);
    }
    const metadata = await this.getMetadataById(record.did);

    return {
      id: record.did,
      method: IdentityType.KEY,
      displayName: metadata.displayName,
      createdAtUTC: record.createdAt.toISOString(),
      colors: metadata.colors,
      controller: record.did,
      keyType: signingKey.type.toString(),
      publicKeyBase58: signingKey.publicKeyBase58,
    };
  }

  validArchivedIdentity(metadata: IdentityMetadataRecord): void {
    if(!metadata.isArchived){
      throw new Error(`${AriesAgent.DID_NOT_ARCHIVED} ${metadata.id}`);
    }
  }

  async updateIdentityMetadata(identifier: string, metadata: UpdateIdentityMetadata): Promise<void> {
    return this.agent.modules.generalStorage.updateIdentityMetadata(identifier, metadata);
  }

  async deleteIdentity(identifier: string): Promise<void> {
    const metadata = await this.getMetadataById(identifier);
    this.validArchivedIdentity(metadata);
    await this.agent.modules.generalStorage.deleteIdentityMetadata(identifier);
  }

  async archiveIdentity(identifier: string): Promise<void> {
    return this.agent.modules.generalStorage.archiveIdentityMetadata(identifier);
  }

  async restoreIdentity(identifier: string): Promise<void> {
    const metadata = await this.getMetadataById(identifier);
    this.validArchivedIdentity(metadata);
    return this.agent.modules.generalStorage.updateIdentityMetadata(identifier, { isArchived: false });
  }

}

export { AriesAgent, agentDependencies };
