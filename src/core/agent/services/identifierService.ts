import { HabState, Operation, Signer } from "signify-ts";
import {
  CreateIdentifierResult,
  CreationStatus,
  IdentifierDetails,
  IdentifierShortDetails,
} from "./identifier.types";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../records/identifierMetadataRecord";
import { AgentService } from "./agentService";
import { OnlineOnly, randomSalt, waitAndGetDoneOp } from "./utils";
import {
  AgentServicesProps,
  IdentifierResult,
  MiscRecordId,
} from "../agent.types";
import { BasicRecord, BasicStorage, IdentifierStorage } from "../records";
import { OperationPendingStorage } from "../records/operationPendingStorage";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { Agent } from "../agent";
import { PeerConnection } from "../../cardano/walletConnect/peerConnection";
import { ConnectionService } from "./connectionService";
import {
  EventTypes,
  IdentifierAddedEvent,
  IdentifierRemovedEvent,
  OperationAddedEvent,
} from "../event.types";
import { StorageMessage } from "../../storage/storage.types";

const UI_THEMES = [
  0, 1, 2, 3, 10, 11, 12, 13, 20, 21, 22, 23, 30, 31, 32, 33, 40, 41, 42, 43,
];

class IdentifierService extends AgentService {
  static readonly IDENTIFIER_METADATA_RECORD_MISSING =
    "Identifier metadata record does not exist";
  static readonly THEME_WAS_NOT_VALID = "Identifier theme was not valid";
  static readonly EXN_MESSAGE_NOT_FOUND =
    "There's no exchange message for the given SAID";
  static readonly FAILED_TO_ROTATE_AID =
    "Failed to rotate AID, operation not completing...";
  static readonly FAILED_TO_OBTAIN_KEY_MANAGER =
    "Failed to obtain key manager for given AID";
  static readonly IDENTIFIER_NOT_COMPLETE =
    "Cannot fetch identifier details as the identifier is still pending or failed to complete";
  static readonly INSUFFICIENT_WITNESSES_AVAILABLE =
    "An insufficient number of discoverable witnesses are available on connected KERIA instance";
  static readonly MISCONFIGURED_AGENT_CONFIGURATION =
    "Misconfigured KERIA agent for this wallet type";
  static readonly INVALID_QUEUED_DISPLAY_NAMES_FORMAT =
    "Queued display names has invalid format";
  static readonly CANNOT_FIND_EXISTING_IDENTIFIER_BY_SEARCH = "Identifier name taken on KERIA, but cannot be found when iterating over identifier list";

  protected readonly identifierStorage: IdentifierStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;
  protected readonly connections: ConnectionService;
  protected readonly basicStorage: BasicStorage;

  constructor(
    agentServiceProps: AgentServicesProps,
    identifierStorage: IdentifierStorage,
    operationPendingStorage: OperationPendingStorage,
    connections: ConnectionService,
    basicStorage: BasicStorage
  ) {
    super(agentServiceProps);
    this.identifierStorage = identifierStorage;
    this.operationPendingStorage = operationPendingStorage;
    this.connections = connections;
    this.basicStorage = basicStorage;
  }

  onIdentifierRemoved() {
    this.props.eventEmitter.on(
      EventTypes.IdentifierRemoved,
      (data: IdentifierRemovedEvent) => {
        this.deleteIdentifier(data.payload.id!);
      }
    );
  }

  onIdentifierAdded(callback: (event: IdentifierAddedEvent) => void) {
    this.props.eventEmitter.on(EventTypes.IdentifierAdded, callback);
  }

  async getIdentifiers(): Promise<IdentifierShortDetails[]> {
    const identifiers: IdentifierShortDetails[] = [];
    const listMetadata: IdentifierMetadataRecord[] =
      await this.identifierStorage.getAllIdentifierMetadata();

    for (let i = 0; i < listMetadata.length; i++) {
      const metadata = listMetadata[i];
      const identifier: IdentifierShortDetails = {
        displayName: metadata.displayName,
        id: metadata.id,
        createdAtUTC: metadata.createdAt.toISOString(),
        theme: metadata.theme,
        creationStatus: metadata.creationStatus ?? false,
        groupMetadata: metadata.groupMetadata,
      };
      if (metadata.multisigManageAid) {
        identifier.multisigManageAid = metadata.multisigManageAid;
      }
      identifiers.push(identifier);
    }
    return identifiers;
  }

  @OnlineOnly
  async getIdentifier(identifier: string): Promise<IdentifierDetails> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    if (metadata.creationStatus === CreationStatus.PENDING || metadata.creationStatus === CreationStatus.FAILED) {
      throw new Error(IdentifierService.IDENTIFIER_NOT_COMPLETE);
    }

    const aid = await this.props.signifyClient
      .identifiers()
      .get(identifier)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
          throw new Error(`${Agent.MISSING_DATA_ON_KERIA}: ${metadata.id}`, {
            cause: error,
          });
        } else {
          throw error;
        }
      });

    let members;
    if (aid.group) {
      members = (
        await this.props.signifyClient.identifiers().members(identifier)
      ).signing.map((member: any) => member.aid);
    }

    return {
      id: aid.prefix,
      displayName: metadata.displayName,
      createdAtUTC: metadata.createdAt.toISOString(),
      theme: metadata.theme,
      multisigManageAid: metadata.multisigManageAid,
      creationStatus: metadata.creationStatus,
      groupMetadata: metadata.groupMetadata,
      s: aid.state.s,
      dt: aid.state.dt,
      kt: aid.state.kt,
      k: aid.state.k,
      nt: aid.state.nt,
      n: aid.state.n,
      bt: aid.state.bt,
      b: aid.state.b,
      di: aid.state.di,
      members,
    };
  }

  async resolvePendingIdentifiers() {
    const pendingIdentifierCreation = await this.basicStorage.findById(
      MiscRecordId.IDENTIFIERS_PENDING_CREATION
    );

    if (!pendingIdentifierCreation) return;

    if (
      !Array.isArray(pendingIdentifierCreation.content.queuedDisplayNames)
    ) {
      throw new Error(IdentifierService.INVALID_QUEUED_DISPLAY_NAMES_FORMAT);
    }

    for (const queuedDisplayName of pendingIdentifierCreation.content
      .queuedDisplayNames) {
      let metadata: Omit<IdentifierMetadataRecordProps, "id" | "createdAt">;
      const [themeString, rest] = queuedDisplayName.split(":");
      const theme = Number(themeString);
      const groupMatch = rest.match(/^(\d)-(.+)-(.+)$/);
      if (groupMatch) {
        const [, initiatorFlag, groupId, displayName] = groupMatch;
        metadata = {
          theme,
          displayName,
          groupMetadata: {
            groupId,
            groupInitiator: initiatorFlag === "1",
            groupCreated: false,
          },
        };
      } else {
        metadata = {
          theme,
          displayName: rest,
        };
      }

      await this.createIdentifier(metadata, true);
    }
  }

  @OnlineOnly
  async createIdentifier(
    metadata: Omit<IdentifierMetadataRecordProps, "id" | "createdAt">,
    backgroundTask = false,
  ): Promise<CreateIdentifierResult> {
    const { toad, witnesses } = await this.getAvailableWitnesses();

    if (!UI_THEMES.includes(metadata.theme)) {
      throw new Error(IdentifierService.THEME_WAS_NOT_VALID);
    }

    // For simplicity, it's up to the UI to provide a unique name
    let name = `${metadata.theme}:${metadata.displayName}`;
    if (metadata.groupMetadata) {
      const initiatorFlag = metadata.groupMetadata.groupInitiator ? "1" : "0";
      name = `${metadata.theme}:${initiatorFlag}-${metadata.groupMetadata.groupId}:${metadata.displayName}`;
    }

    // For distributed reliability, store name so we can re-try on start-up
    // Hence much of this function will ignore duplicate errors
    if (!backgroundTask) {
      let processingNames = [];
      const pendingIdentifiersRecord = await this.basicStorage.findById(
        MiscRecordId.IDENTIFIERS_PENDING_CREATION
      );
      if (pendingIdentifiersRecord) {
        const { queuedDisplayNames } = pendingIdentifiersRecord.content;
        if (!Array.isArray(queuedDisplayNames)) {
          throw new Error(IdentifierService.INVALID_QUEUED_DISPLAY_NAMES_FORMAT);
        }
        processingNames = queuedDisplayNames;
      }
      processingNames.push(name);
      
      await this.basicStorage.createOrUpdateBasicRecord(
        new BasicRecord({
          id: MiscRecordId.IDENTIFIERS_PENDING_CREATION,
          content: { queuedDisplayNames: processingNames },
        })
      );
    }

    let identifier;
    try {
      const result = await this.props.signifyClient
        .identifiers()
        .create(name, {
          toad,
          wits: witnesses,
        });
      await result.op();  // @TODO - foconnor: Update Signify to await the POST before returning so error thrown predicably
      identifier = result.serder.ked.i;
    } catch (error) {
      if (!(error instanceof Error)) throw error;

      const [_, status, reason] = error.message.split(" - ");
      if (!(/400/gi.test(status) && /already incepted/gi.test(reason))) {
        throw error;
      }

      // @TODO - foconnor: Should have a way in KERIA to search by name
      //  Encoding the name in the URL is problematic, and will be changed to identifier only.
      //  But here we don't know what the identifier is, so we have to manually search.
      const details = await this.searchByName(name);
      if (!details) {
        throw new Error(IdentifierService.CANNOT_FIND_EXISTING_IDENTIFIER_BY_SEARCH);
      }
      identifier = details.prefix;
    }

    // @TODO - foconnor: Need update HabState interface on signify.
    const identifierDetail = (await this.props.signifyClient
      .identifiers()
      .get(identifier)) as HabState & { icp_dt: string };

    const addRoleOperation = await this.props.signifyClient
      .identifiers()
      .addEndRole(identifier, "agent", this.props.signifyClient.agent!.pre);
    await addRoleOperation.op();

    const creationStatus = CreationStatus.PENDING;
    try {
      await this.identifierStorage
        .createIdentifierMetadataRecord({
          id: identifier,
          ...metadata,
          creationStatus,
          createdAt: new Date(identifierDetail.icp_dt),
        });
      
      this.props.eventEmitter.emit<IdentifierAddedEvent>({
        type: EventTypes.IdentifierAdded,
        payload: { identifier: { id: identifier, ...metadata, creationStatus, createdAtUTC: new Date(identifierDetail.icp_dt).toISOString() } },
      });
    } catch (error) {
      if (!(error instanceof Error && error.message.startsWith(StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG))) {
        throw error;
      }
    }

    try {
      const pendingOperation = await this.operationPendingStorage.save({
        id: `witness.${identifier}`,
        recordType: OperationPendingRecordType.Witness,
      });
      
      this.props.eventEmitter.emit<OperationAddedEvent>({
        type: EventTypes.OperationAdded,
        payload: { operation: pendingOperation },
      }); 
    } catch (error) {
      if (!(error instanceof Error && error.message.startsWith(StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG))) {
        throw error;
      }
    }
    
    // Finally, remove from the re-try record
    const updatedRecord = await this.basicStorage.findById(
      MiscRecordId.IDENTIFIERS_PENDING_CREATION
    );

    if (updatedRecord) {
      const { queuedDisplayNames } = updatedRecord.content;
      if (!Array.isArray(queuedDisplayNames)) {
        throw new Error(IdentifierService.INVALID_QUEUED_DISPLAY_NAMES_FORMAT);
      }

      const index = queuedDisplayNames.indexOf(name);
      if (index !== -1) {
        queuedDisplayNames.splice(index, 1);
      }
      await this.basicStorage.update(updatedRecord);
    }
    return { identifier, createdAt: identifierDetail.icp_dt };
  }

  async deleteIdentifier(identifier: string): Promise<void> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    if (metadata.groupMetadata) {
      await this.deleteGroupLinkedConnections(metadata.groupMetadata.groupId);
    }

    if (metadata.multisigManageAid) {
      const localMember = await this.identifierStorage.getIdentifierMetadata(
        metadata.multisigManageAid
      );
      await this.identifierStorage.updateIdentifierMetadata(
        metadata.multisigManageAid,
        {
          isDeleted: true,
          pendingDeletion: false,
        }
      );
      await this.props.signifyClient.identifiers().update(localMember.id, {
        name: `XX-${randomSalt()}:${localMember.groupMetadata?.groupId}:${
          localMember.displayName
        }`,
      });
      await this.deleteGroupLinkedConnections(
        localMember.groupMetadata!.groupId
      );
    }

    await this.props.signifyClient.identifiers().update(identifier, {
      name: `XX-${randomSalt()}:${metadata.displayName}`,
    });

    await this.identifierStorage.updateIdentifierMetadata(identifier, {
      isDeleted: true,
      pendingDeletion: false,
    });

    const connectedDApp =
      PeerConnection.peerConnection.getConnectedDAppAddress();
    if (
      connectedDApp !== "" &&
      metadata.id ===
        (await PeerConnection.peerConnection.getConnectingIdentifier()).id
    ) {
      PeerConnection.peerConnection.disconnectDApp(connectedDApp, true);
    }
  }

  async removeIdentifiersPendingDeletion(): Promise<void> {
    const pendingIdentifierDeletions =
      await this.identifierStorage.getIdentifiersPendingDeletion();

    for (const identifier of pendingIdentifierDeletions) {
      await this.deleteIdentifier(identifier.id);
    }
  }

  async markIdentifierPendingDelete(id: string) {
    const identifierProps = await this.identifierStorage.getIdentifierMetadata(
      id
    );
    if (!identifierProps) {
      throw new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING);
    }
    identifierProps.pendingDeletion = true;
    await this.identifierStorage.updateIdentifierMetadata(id, {
      pendingDeletion: true,
    });

    this.props.eventEmitter.emit<IdentifierRemovedEvent>({
      type: EventTypes.IdentifierRemoved,
      payload: {
        id,
      },
    });
  }

  private async deleteGroupLinkedConnections(groupId: string) {
    const connections = await this.connections.getMultisigLinkedContacts(
      groupId
    );
    for (const connection of connections) {
      await this.connections.deleteConnectionById(connection.id);
    }
  }

  async deleteStaleLocalIdentifier(identifier: string): Promise<void> {
    const connectedDApp =
      PeerConnection.peerConnection.getConnectedDAppAddress();
    if (
      connectedDApp !== "" &&
      identifier ===
        (await PeerConnection.peerConnection.getConnectingIdentifier()).id
    ) {
      PeerConnection.peerConnection.disconnectDApp(connectedDApp, true);
    }
    await this.identifierStorage.deleteIdentifierMetadata(identifier);
  }

  async updateIdentifier(
    identifier: string,
    data: Pick<
      IdentifierMetadataRecordProps,
      "theme" | "displayName" | "groupMetadata"
    >
  ): Promise<void> {
    await this.props.signifyClient.identifiers().update(identifier, {
      name: `${data.theme}:${data.displayName}`,
    });
    return this.identifierStorage.updateIdentifierMetadata(identifier, {
      theme: data.theme,
      displayName: data.displayName,
    });
  }

  @OnlineOnly
  async getSigner(identifier: string): Promise<Signer> {
    const aid = await this.props.signifyClient.identifiers().get(identifier);

    const manager = this.props.signifyClient.manager;
    if (manager) {
      return (manager.get(aid)).signers[0];
    } else {
      throw new Error(IdentifierService.FAILED_TO_OBTAIN_KEY_MANAGER);
    }
  }

  async syncKeriaIdentifiers() {
    const cloudIdentifiers: any[] = [];
    let returned = -1;
    let iteration = 0;

    while (returned !== 0) {
      const result = await this.props.signifyClient.identifiers().list(iteration * (24 + 1), 24 + (iteration * (24 + 1)));
      cloudIdentifiers.push(...result.aids);

      returned = result.aids.length;
      iteration += 1;
    }
    
    const localIdentifiers =
      await this.identifierStorage.getKeriIdentifiersMetadata();
    
    const unSyncedData = cloudIdentifiers.filter(
      (identifier: IdentifierResult) =>
        !localIdentifiers.find((item) => identifier.prefix === item.id)
    );

    const [unSyncedDataWithGroup, unSyncedDataWithoutGroup] = [
      unSyncedData.filter((item: HabState) => item.group !== undefined),
      unSyncedData.filter((item: HabState) => item.group === undefined),
    ];

    for (const identifier of unSyncedDataWithoutGroup) {
      if (identifier.name.startsWith("XX")) {
        continue;
      }

      const op: Operation = await this.props.signifyClient
        .operations()
        .get(`witness.${identifier.prefix}`);
      
      const creationStatus = op.done ? (op.error ? CreationStatus.FAILED : CreationStatus.COMPLETE) : CreationStatus.PENDING;
      if (creationStatus === CreationStatus.PENDING) {
        const pendingOperation = await this.operationPendingStorage.save({
          id: op.name,
          recordType: OperationPendingRecordType.Witness,
        });
        this.props.eventEmitter.emit<OperationAddedEvent>({
          type: EventTypes.OperationAdded,
          payload: { operation: pendingOperation },
        });
      }

      const name = identifier.name.split(":");
      const theme = parseInt(name[0], 10);
      const isMultiSig = name.length === 3;
      const identifierDetail = (await this.props.signifyClient
        .identifiers()
        .get(identifier.prefix)) as HabState & { icp_dt: string };
      
      if (isMultiSig) {
        const groupId = identifier.name.split(":")[1];
        const groupInitiator = groupId.split("-")[0] === "1";

        await this.identifierStorage.createIdentifierMetadataRecord({
          id: identifier.prefix,
          displayName: identifier.name.split(":")[1],
          theme,
          groupMetadata: {
            groupId,
            groupCreated: false,
            groupInitiator,
          },
          creationStatus,
          createdAt: new Date(identifierDetail.icp_dt),
        });
        continue;
      }

      await this.identifierStorage.createIdentifierMetadataRecord({
        id: identifier.prefix,
        displayName: identifier.name.split(":")[1],
        theme,
        creationStatus,
        createdAt: new Date(identifierDetail.icp_dt),
      });
    }

    for (const identifier of unSyncedDataWithGroup) {
      if (identifier.name.startsWith("XX")) {
        continue;
      }
      
      const identifierDetail = (await this.props.signifyClient
        .identifiers()
        .get(identifier.prefix)) as HabState & { icp_dt: string };

      const multisigManageAid = identifier.group.mhab.prefix;
      const groupId = identifier.group.mhab.name.split(":")[1];
      const theme = parseInt(identifier.name.split(":")[0], 10);
      const groupInitiator = groupId.split("-")[0] === "1";
      
      const op = await this.props.signifyClient
        .operations()
        .get(`group.${identifier.prefix}`);
      
      const creationStatus = op.done ? (op.error ? CreationStatus.FAILED : CreationStatus.COMPLETE) : CreationStatus.PENDING;
      if (creationStatus === CreationStatus.PENDING) {
        const pendingOperation = await this.operationPendingStorage.save({
          id: op.name,
          recordType: OperationPendingRecordType.Group,
        });
        this.props.eventEmitter.emit<OperationAddedEvent>({
          type: EventTypes.OperationAdded,
          payload: { operation: pendingOperation },
        });
      }

      await this.identifierStorage.updateIdentifierMetadata(multisigManageAid, {
        groupMetadata: {
          groupId,
          groupCreated: true,
          groupInitiator,
        },
      });

      await this.identifierStorage.createIdentifierMetadataRecord({
        id: identifier.prefix,
        displayName: groupId,
        theme,
        multisigManageAid,
        creationStatus,
        createdAt: new Date(identifierDetail.icp_dt),
      });
    }
  }

  @OnlineOnly
  async rotateIdentifier(identifier: string) {
    const rotateResult = await this.props.signifyClient
      .identifiers()
      .rotate(identifier);
    const operation = await waitAndGetDoneOp(
      this.props.signifyClient,
      await rotateResult.op()
    );
    if (!operation.done) {
      throw new Error(IdentifierService.FAILED_TO_ROTATE_AID);
    }
  }

  async getAvailableWitnesses(): Promise<{ toad: number, witnesses: string[] }> {
    const config = await this.props.signifyClient.config().get();
    if (!config.iurls) {
      throw new Error(IdentifierService.MISCONFIGURED_AGENT_CONFIGURATION);
    }

    const witnesses = [];
    for (const oobi of config.iurls) {
      const role = new URL(oobi).searchParams.get("role");
      if (role === "witness") {
        witnesses.push(oobi.split("/oobi/")[1].split("/")[0]); // EID - endpoint identifier
      }
    }

    const uniquew = [...new Set(witnesses)];
    if (uniquew.length >= 12) return { toad: 8, witnesses: uniquew.slice(0, 12) };
    if (uniquew.length >= 10) return { toad: 7, witnesses: uniquew.slice(0, 10) };
    if (uniquew.length >= 9) return { toad: 6, witnesses: uniquew.slice(0, 9) };
    if (uniquew.length >= 7) return { toad: 5, witnesses: uniquew.slice(0, 7) };
    if (uniquew.length >= 6) return { toad: 4, witnesses: uniquew.slice(0, 6) };

    throw new Error(IdentifierService.INSUFFICIENT_WITNESSES_AVAILABLE);
  }

  private async searchByName(name: string): Promise<HabState & { icp_dt: string } | undefined> {
    let returned = -1;
    let iteration = 0;

    while (returned !== 0) {
      const result = await this.props.signifyClient.identifiers().list(iteration * (24 + 1), 24 + (iteration * (24 + 1)));
      for (const identifier of result.aids) {
        if (identifier.name === name) return identifier;
      }

      returned = result.aids.length;
      iteration += 1;
    }
  }
}

export { IdentifierService };
