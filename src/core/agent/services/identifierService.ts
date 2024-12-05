import { HabState, Operation, Salter, Signer } from "signify-ts";
import {
  CreateIdentifierResult,
  IdentifierDetails,
  IdentifierShortDetails,
} from "./identifier.types";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../records/identifierMetadataRecord";
import { AgentService } from "./agentService";
import { OnlineOnly, randomSalt, waitAndGetDoneOp } from "./utils";
import { AgentServicesProps, IdentifierResult } from "../agent.types";
import { IdentifierStorage } from "../records";
import { ConfigurationService } from "../../configuration";
import { BackingMode } from "../../configuration/configurationService.types";
import { OperationPendingStorage } from "../records/operationPendingStorage";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { Agent } from "../agent";
import { PeerConnection } from "../../cardano/walletConnect/peerConnection";
import { ConnectionService } from "./connectionService";
import {
  EventTypes,
  IdentifierRemovedEvent,
  OperationAddedEvent,
} from "../event.types";

const identifierTypeThemes = [
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
  static readonly IDENTIFIER_NAME_TAKEN =
    "Identifier name has already been used on KERIA";
  static readonly IDENTIFIER_IS_PENDING =
    "Cannot fetch identifier details as the identifier is still pending";
  protected readonly identifierStorage: IdentifierStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;
  protected readonly connections: ConnectionService;

  constructor(
    agentServiceProps: AgentServicesProps,
    identifierStorage: IdentifierStorage,
    operationPendingStorage: OperationPendingStorage,
    connections: ConnectionService
  ) {
    super(agentServiceProps);
    this.identifierStorage = identifierStorage;
    this.operationPendingStorage = operationPendingStorage;
    this.connections = connections;
  }

  onIdentifierRemoved() {
    this.props.eventEmitter.on(
      EventTypes.IdentifierRemoved,
      (data: IdentifierRemovedEvent) => {
        this.deleteIdentifier(data.payload.id!);
      }
    );
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
        isPending: metadata.isPending ?? false,
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
    if (metadata.isPending) {
      throw new Error(IdentifierService.IDENTIFIER_IS_PENDING);
    }
    const aid = await this.props.signifyClient
      .identifiers()
      .get(identifier)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
          throw new Error(`${Agent.MISSING_DATA_ON_KERIA}: ${metadata.id}`);
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
      isPending: metadata.isPending ?? false,
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

  @OnlineOnly
  async createIdentifier(
    metadata: Omit<IdentifierMetadataRecordProps, "id" | "createdAt">
  ): Promise<CreateIdentifierResult> {
    const startTime = Date.now();

    if (!identifierTypeThemes.includes(metadata.theme)) {
      throw new Error(`${IdentifierService.THEME_WAS_NOT_VALID}`);
    }

    let name = `${metadata.theme}:${metadata.displayName}`;
    if (metadata.groupMetadata) {
      const initiatorFlag = metadata.groupMetadata.groupInitiator ? "1" : "0";
      name = `${metadata.theme}:${initiatorFlag}-${metadata.groupMetadata.groupId}:${metadata.displayName}`;
    } 
    const operation = await this.props.signifyClient.identifiers().create(name);
    let op = await operation.op().catch((error) => {
      const err = error.message.split(" - ");
      if (/400/gi.test(err[1]) && /already incepted/gi.test(err[2])) {
        throw new Error(`${IdentifierService.IDENTIFIER_NAME_TAKEN}: ${name}`);
      }
      throw error;
    });
    const identifier = operation.serder.ked.i;
    const addRoleOperation = await this.props.signifyClient
      .identifiers()
      .addEndRole(identifier, "agent", this.props.signifyClient.agent!.pre);
    await addRoleOperation.op();

    const isPending = !op.done;
    if (isPending) {
      op = await waitAndGetDoneOp(
        this.props.signifyClient,
        op,
        2000 - (Date.now() - startTime)
      );
      if (!op.done) {
        const pendingOperation = await this.operationPendingStorage.save({
          id: op.name,
          recordType: OperationPendingRecordType.Witness,
        });
        this.props.eventEmitter.emit<OperationAddedEvent>({
          type: EventTypes.OperationAdded,
          payload: { operation: pendingOperation },
        });
      }
    }
    await this.identifierStorage.createIdentifierMetadataRecord({
      id: identifier,
      ...metadata,
      isPending: !op.done,
    });
    return { identifier, isPending: !op.done };
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
      return (await manager.get(aid)).signers[0];
    } else {
      throw new Error(IdentifierService.FAILED_TO_OBTAIN_KEY_MANAGER);
    }
  }

  @OnlineOnly
  async syncKeriaIdentifiers() {
    const { aids: signifyIdentifiers } = await this.props.signifyClient
      .identifiers()
      .list();
    const storageIdentifiers =
      await this.identifierStorage.getKeriIdentifiersMetadata();
    const unSyncedData = signifyIdentifiers.filter(
      (identifier: IdentifierResult) =>
        !storageIdentifiers.find((item) => identifier.prefix === item.id)
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
        .get(`witness.${identifier.prefix}`)
        .catch(async (error) => {
          const status = error.message.split(" - ")[1];
          if (/404/gi.test(status)) {
            return await this.props.signifyClient
              .operations()
              .get(`done.${identifier.prefix}`);
          }
          throw error;
        });
      const isPending = !op.done;

      if(isPending){
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

      if(isMultiSig){
        const groupId = identifier.name.split(":")[1];
        const groupInitiator = groupId.split("-")[0] === "1";

        await this.identifierStorage.createIdentifierMetadataRecord({
          id: identifier.prefix,
          displayName: groupId,
          theme,
          groupMetadata: {
            groupId,
            groupCreated: false,
            groupInitiator
          },
          isPending
        });

        continue;
      }

      await this.identifierStorage.createIdentifierMetadataRecord({
        id: identifier.prefix,
        displayName: identifier.prefix,
        theme,
        isPending,
      });
    }

    for (const identifier of unSyncedDataWithGroup) {
      if (identifier.name.startsWith("XX")) {
        continue;
      }

      const multisigManageAid = identifier.group.mhab.prefix;
      const groupId = identifier.group.mhab.name.split(":")[1];
      const theme = parseInt(identifier.name.split(":")[0], 10);
      const groupInitiator = groupId.split("-")[0] === "1";
      const op = await this.props.signifyClient.operations().get(`group.${identifier.prefix}`)
      const isPending = !op.done;

      if(isPending){
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
          groupInitiator
        }
      });
        
      await this.identifierStorage.createIdentifierMetadataRecord({
        id: identifier.prefix,
        displayName: groupId,
        theme,
        multisigManageAid,
        isPending
      })
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

  private getCreateAidOptions() {
    if (ConfigurationService.env.keri.backing.mode === BackingMode.LEDGER) {
      return {
        toad: 1,
        wits: [ConfigurationService.env.keri.backing.ledger.aid],
        count: 1,
        ncount: 1,
        isith: "1",
        nsith: "1",
        data: [{ ca: ConfigurationService.env.keri.backing.ledger.address }],
      };
    } else if (
      ConfigurationService.env.keri.backing.mode === BackingMode.POOLS
    ) {
      return {
        toad: ConfigurationService.env.keri.backing.pools.length,
        wits: ConfigurationService.env.keri.backing.pools,
      };
    }
    return {};
  }
}

export { IdentifierService };
