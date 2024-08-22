import { v4 as uuidv4 } from "uuid";
import { Signer } from "signify-ts";
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
import { OnlineOnly, waitAndGetDoneOp } from "./utils";
import { AgentServicesProps, IdentifierResult } from "../agent.types";
import { IdentifierStorage } from "../records";
import { ConfigurationService } from "../../configuration";
import { BackingMode } from "../../configuration/configurationService.types";
import { OperationPendingStorage } from "../records/operationPendingStorage";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { Agent } from "../agent";
import { PeerConnection } from "../../cardano/walletConnect/peerConnection";

const identifierTypeThemes = [
  0, 1, 2, 3, 10, 11, 12, 13, 20, 21, 22, 23, 30, 31, 32, 33, 40, 41, 42, 43,
];

class IdentifierService extends AgentService {
  static readonly IDENTIFIER_METADATA_RECORD_MISSING =
    "Identifier metadata record does not exist";
  static readonly IDENTIFIER_NOT_ARCHIVED = "Identifier was not archived";
  static readonly THEME_WAS_NOT_VALID = "Identifier theme was not valid";
  static readonly EXN_MESSAGE_NOT_FOUND =
    "There's no exchange message for the given SAID";
  static readonly FAILED_TO_ROTATE_AID =
    "Failed to rotate AID, operation not completing...";
  static readonly FAILED_TO_OBTAIN_KEY_MANAGER =
    "Failed to obtain key manager for given AID";
  static readonly IDENTIFIER_IS_PENDING =
    "Cannot fetch identifier details as the identifier is still pending";
  protected readonly identifierStorage: IdentifierStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;

  constructor(
    agentServiceProps: AgentServicesProps,
    identifierStorage: IdentifierStorage,
    operationPendingStorage: OperationPendingStorage
  ) {
    super(agentServiceProps);
    this.identifierStorage = identifierStorage;
    this.operationPendingStorage = operationPendingStorage;
  }

  async getIdentifiers(getArchived = false): Promise<IdentifierShortDetails[]> {
    const identifiers: IdentifierShortDetails[] = [];
    const listMetadata: IdentifierMetadataRecord[] =
      await this.identifierStorage.getAllIdentifierMetadata(getArchived);

    for (let i = 0; i < listMetadata.length; i++) {
      const metadata = listMetadata[i];
      const identifier: IdentifierShortDetails = {
        displayName: metadata.displayName,
        id: metadata.id,
        signifyName: metadata.signifyName,
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
    if (metadata.isPending && metadata.signifyOpName) {
      throw new Error(IdentifierService.IDENTIFIER_IS_PENDING);
    }
    const aid = await this.props.signifyClient
      .identifiers()
      .get(metadata.signifyName)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
          throw new Error(`${Agent.MISSING_DATA_ON_KERIA}: ${metadata.id}`);
        } else {
          throw error;
        }
      });

    return {
      id: aid.prefix,
      displayName: metadata.displayName,
      createdAtUTC: metadata.createdAt.toISOString(),
      signifyName: metadata.signifyName,
      theme: metadata.theme,
      signifyOpName: metadata.signifyOpName,
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
    };
  }

  async getKeriIdentifierByGroupId(
    groupId: string
  ): Promise<IdentifierShortDetails | null> {
    const metadata =
      await this.identifierStorage.getIdentifierMetadataByGroupId(groupId);
    if (!metadata) {
      return null;
    }
    return {
      displayName: metadata.displayName,
      id: metadata.id,
      signifyName: metadata.signifyName,
      createdAtUTC: metadata.createdAt.toISOString(),
      theme: metadata.theme,
      isPending: metadata.isPending ?? false,
    };
  }

  @OnlineOnly
  async createIdentifier(
    metadata: Omit<
      IdentifierMetadataRecordProps,
      "id" | "createdAt" | "isArchived" | "signifyName"
    >
  ): Promise<CreateIdentifierResult> {
    const startTime = Date.now();
    this.validIdentifierMetadata(metadata);
    const signifyName = uuidv4();
    const operation = await this.props.signifyClient
      .identifiers()
      .create(signifyName); //, this.getCreateAidOptions());
    let op = await operation.op();
    const signifyOpName = op.name;
    const addRoleOperation = await this.props.signifyClient
      .identifiers()
      .addEndRole(signifyName, "agent", this.props.signifyClient.agent!.pre);
    await addRoleOperation.op();
    const identifier = operation.serder.ked.i;
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
        Agent.agent.signifyNotifications.addPendingOperationToQueue(
          pendingOperation
        );
      }
    }
    await this.identifierStorage.createIdentifierMetadataRecord({
      id: identifier,
      ...metadata,
      signifyOpName: signifyOpName,
      isPending: !op.done,
      signifyName: signifyName,
    });
    return { identifier, signifyName, isPending: !op.done };
  }

  async archiveIdentifier(identifier: string): Promise<void> {
    return this.identifierStorage.updateIdentifierMetadata(identifier, {
      isArchived: true,
    });
  }

  async deleteIdentifier(identifier: string): Promise<void> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    this.validArchivedIdentifier(metadata);
    await this.identifierStorage.updateIdentifierMetadata(identifier, {
      isDeleted: true,
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

  async restoreIdentifier(identifier: string): Promise<void> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    this.validArchivedIdentifier(metadata);
    await this.identifierStorage.updateIdentifierMetadata(identifier, {
      isArchived: false,
    });
  }

  async updateIdentifier(
    identifier: string,
    data: Pick<
      IdentifierMetadataRecordProps,
      "theme" | "displayName" | "groupMetadata"
    >
  ): Promise<void> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    this.validIdentifierMetadata(metadata);
    return this.identifierStorage.updateIdentifierMetadata(identifier, {
      theme: data.theme,
      displayName: data.displayName,
    });
  }

  @OnlineOnly
  async getSigner(identifier: string): Promise<Signer> {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    this.validIdentifierMetadata(metadata);

    const aid = await this.props.signifyClient
      .identifiers()
      .get(metadata.signifyName);

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
    if (unSyncedData.length) {
      //sync the storage with the signify data
      for (const identifier of unSyncedData) {
        await this.identifierStorage.createIdentifierMetadataRecord({
          id: identifier.prefix,
          displayName: identifier.prefix, //same as the id at the moment
          theme: 0,
          signifyName: identifier.name,
        });
      }
    }
  }

  private validArchivedIdentifier(metadata: IdentifierMetadataRecord): void {
    if (!metadata.isArchived) {
      throw new Error(
        `${IdentifierService.IDENTIFIER_NOT_ARCHIVED} ${metadata.id}`
      );
    }
  }

  validIdentifierMetadata(
    metadata: Pick<IdentifierMetadataRecordProps, "theme">
  ): void {
    if (metadata.theme && !identifierTypeThemes.includes(metadata.theme)) {
      throw new Error(`${IdentifierService.THEME_WAS_NOT_VALID}`);
    }
  }

  @OnlineOnly
  async rotateIdentifier(identifier: string) {
    const metadata = await this.identifierStorage.getIdentifierMetadata(
      identifier
    );
    const rotateResult = await this.props.signifyClient
      .identifiers()
      .rotate(metadata.signifyName);
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
