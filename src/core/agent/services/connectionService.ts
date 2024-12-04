import { Contact, Operation, Salter, State } from "signify-ts";
import { Agent } from "../agent";
import {
  AgentServicesProps,
  ConnectionDetails,
  ConnectionNoteDetails,
  ConnectionNoteProps,
  ConnectionShortDetails,
  ConnectionStatus,
  KeriConnectionType,
  OobiScan,
} from "../agent.types";
import {
  ConnectionRecord,
  ConnectionStorage,
  CredentialStorage,
  IdentifierStorage,
  OperationPendingStorage,
} from "../records";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { AgentService } from "./agentService";
import { OnlineOnly, randomSalt, waitAndGetDoneOp } from "./utils";
import { StorageMessage } from "../../storage/storage.types";
import {
  ConnectionRemovedEvent,
  ConnectionStateChangedEvent,
  EventTypes,
  OperationAddedEvent,
} from "../event.types";
import {
  ConnectionHistoryItem,
  KeriaContactKeyPrefix,
} from "./connectionService.types";

class ConnectionService extends AgentService {
  protected readonly connectionStorage!: ConnectionStorage;
  protected readonly credentialStorage: CredentialStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;
  protected readonly identifierStorage: IdentifierStorage;

  constructor(
    agentServiceProps: AgentServicesProps,
    connectionStorage: ConnectionStorage,
    credentialStorage: CredentialStorage,
    operationPendingStorage: OperationPendingStorage,
    identifierStorage: IdentifierStorage
  ) {
    super(agentServiceProps);
    this.connectionStorage = connectionStorage;
    this.credentialStorage = credentialStorage;
    this.operationPendingStorage = operationPendingStorage;
    this.identifierStorage = identifierStorage;
  }

  static readonly CONNECTION_NOTE_RECORD_NOT_FOUND =
    "Connection note record not found";
  static readonly CONNECTION_METADATA_RECORD_NOT_FOUND =
    "Connection metadata record not found";
  static readonly DEFAULT_ROLE = "agent";
  static readonly FAILED_TO_RESOLVE_OOBI =
    "Failed to resolve OOBI, operation not completing...";
  static readonly CANNOT_GET_OOBI = "No OOBI available from KERIA";

  onConnectionStateChanged(
    callback: (event: ConnectionStateChangedEvent) => void
  ) {
    this.props.eventEmitter.on(EventTypes.ConnectionStateChanged, callback);
  }

  onConnectionAdded() {
    this.props.eventEmitter.on(
      EventTypes.ConnectionStateChanged,
      (event: ConnectionStateChangedEvent) => {
        if (
          event.payload.url &&
          event.payload.status === ConnectionStatus.PENDING
        ) {
          this.resolveOobi(event.payload.url, event.payload.isMultiSigInvite);
        }
      }
    );
  }

  onConnectionRemoved() {
    this.props.eventEmitter.on(
      EventTypes.ConnectionRemoved,
      (data: ConnectionRemovedEvent) =>
        this.deleteConnectionById(data.payload.connectionId!)
    );
  }

  @OnlineOnly
  async connectByOobiUrl(url: string): Promise<OobiScan> {
    const multiSigInvite = url.includes("groupId");
    const connectionId = new URL(url).pathname
      .split("/oobi/")
      .pop()!
      .split("/")[0];

    const alias = new URL(url).searchParams.get("name") ?? randomSalt();
    const connectionDate = new Date().toISOString();
    const groupId = new URL(url).searchParams.get("groupId") ?? "";

    const connectionMetadata: Record<string, unknown> = {
      alias,
      oobi: url,
      pending: true,
      createdAtUTC: connectionDate,
    };

    const connection = {
      id: connectionId,
      createdAtUTC: connectionDate,
      oobi: url,
      status: ConnectionStatus.PENDING,
      label: alias,
      groupId,
    };

    if (multiSigInvite) {
      const oobiResult = (await this.resolveOobi(url, multiSigInvite)) as {
        op: Operation & { response: State };
        connection: Contact;
        alias: string;
      };
      connection.id = oobiResult.op.response.i;
      connectionMetadata.pending = false;
      connectionMetadata.createdAtUTC = oobiResult.op.response.dt;
      connectionMetadata.status = ConnectionStatus.CONFIRMED;
      connectionMetadata.groupId = groupId;

      const identifierWithGroupId =
        await this.identifierStorage.getIdentifierMetadataByGroupId(groupId);

      // This allows the calling function to create our smid/rmid member identifier.
      // We let the UI handle it as it requires some metadata from the user like display name.
      if (!identifierWithGroupId) {
        await this.createConnectionMetadata(
          oobiResult.op.response.i,
          connectionMetadata
        ).catch((error) => {
          if (
            !(error instanceof Error) ||
            !error.message.includes(
              StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG
            )
          ) {
            throw error;
          }
        });
        return {
          type: KeriConnectionType.MULTI_SIG_INITIATOR,
          groupId,
          connection,
        };
      }
      await this.createConnectionMetadata(connectionId, connectionMetadata);
    } else {
      this.props.eventEmitter.emit<ConnectionStateChangedEvent>({
        type: EventTypes.ConnectionStateChanged,
        payload: {
          isMultiSigInvite: false,
          connectionId,
          status: ConnectionStatus.PENDING,
          url,
          label: alias,
        },
      });

      await this.createConnectionMetadata(connectionId, connectionMetadata);
    }
    return { type: KeriConnectionType.NORMAL, connection };
  }

  async getConnections(): Promise<ConnectionShortDetails[]> {
    const connections = await this.connectionStorage.findAllByQuery({
      groupId: undefined,
      pendingDeletion: false,
    });
    return connections.map((connection) =>
      this.getConnectionShortDetails(connection)
    );
  }

  async getMultisigConnections(): Promise<ConnectionShortDetails[]> {
    const multisigConnections = await this.connectionStorage.findAllByQuery({
      $not: {
        groupId: undefined,
      },
      pendingDeletion: false,
    });

    return multisigConnections.map((connection) =>
      this.getConnectionShortDetails(connection)
    );
  }

  async getMultisigLinkedContacts(
    groupId: string
  ): Promise<ConnectionShortDetails[]> {
    const connectionsDetails: ConnectionShortDetails[] = [];
    const associatedContacts = await this.connectionStorage.findAllByQuery({
      groupId,
      pendingDeletion: false,
    });
    for (const connection of associatedContacts) {
      connectionsDetails.push(this.getConnectionShortDetails(connection));
    }
    return connectionsDetails;
  }

  private getConnectionShortDetails(
    record: ConnectionRecord
  ): ConnectionShortDetails {
    const connection: ConnectionShortDetails = {
      id: record.id,
      label: record.alias,
      createdAtUTC: record.createdAt.toISOString(),
      status: record.pending
        ? ConnectionStatus.PENDING
        : ConnectionStatus.CONFIRMED,
      oobi: record.oobi,
    };
    const groupId = record.getTag("groupId");
    if (groupId) {
      connection.groupId = groupId as string;
    }
    return connection;
  }

  @OnlineOnly
  async getConnectionById(id: string): Promise<ConnectionDetails> {
    const connection = await this.props.signifyClient
      .contacts()
      .get(id)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
          throw new Error(`${Agent.MISSING_DATA_ON_KERIA}: ${id}`);
        } else {
          throw error;
        }
      });
    const notes: Array<ConnectionNoteDetails> = [];
    const historyItems: Array<ConnectionHistoryItem> = [];
    Object.keys(connection).forEach((key) => {
      if (
        key.startsWith(KeriaContactKeyPrefix.CONNECTION_NOTE) &&
        connection[key]
      ) {
        notes.push(JSON.parse(connection[key] as string));
      } else if (
        key.startsWith(KeriaContactKeyPrefix.HISTORY_IPEX) ||
        key.startsWith(KeriaContactKeyPrefix.HISTORY_REVOKE)
      ) {
        historyItems.push(JSON.parse(connection[key] as string));
      }
    });

    return {
      label: connection?.alias,
      id: connection.id,
      status: ConnectionStatus.CONFIRMED,
      createdAtUTC: connection.createdAt as string,
      serviceEndpoints: [connection.oobi],
      notes,
      historyItems: historyItems
        .sort((a, b) => new Date(b.dt).getTime() - new Date(a.dt).getTime())
        .map((messageRecord) => {
          const { historyType, dt, credentialType } = messageRecord;
          return {
            type: historyType,
            timestamp: dt,
            credentialType,
          };
        }),
    };
  }

  @OnlineOnly
  async deleteConnectionById(id: string): Promise<void> {
    await this.props.signifyClient
      .contacts()
      .delete(id)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (!/404/gi.test(status)) {
          throw error;
        }
      });
    await this.connectionStorage.deleteById(id);
  }

  async markConnectionPendingDelete(id: string) {
    const connectionProps = await this.connectionStorage.findById(id);
    if (!connectionProps) return;
    connectionProps.pendingDeletion = true;
    await this.connectionStorage.update(connectionProps);

    this.props.eventEmitter.emit<ConnectionRemovedEvent>({
      type: EventTypes.ConnectionRemoved,
      payload: {
        connectionId: id,
      },
    });
  }

  async getConnectionsPendingDeletion() {
    const connections = await this.connectionStorage.findAllByQuery({
      pendingDeletion: true,
    });

    return connections.map((connection) => connection.id);
  }

  async getConnectionsPending() {
    const connections = await this.connectionStorage.findAllByQuery({
      pending: true,
      groupId: undefined,
    });

    return connections;
  }

  async deleteStaleLocalConnectionById(id: string): Promise<void> {
    await this.connectionStorage.deleteById(id);
  }

  async getConnectionShortDetailById(
    id: string
  ): Promise<ConnectionShortDetails> {
    const metadata = await this.getConnectionMetadataById(id);
    return this.getConnectionShortDetails(metadata);
  }

  async createConnectionNote(
    connectionId: string,
    note: ConnectionNoteProps
  ): Promise<void> {
    const id = randomSalt();
    await this.props.signifyClient.contacts().update(connectionId, {
      [`${KeriaContactKeyPrefix.CONNECTION_NOTE}${id}`]: JSON.stringify({
        ...note,
        id: `${KeriaContactKeyPrefix.CONNECTION_NOTE}${id}`,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  async updateConnectionNoteById(
    connectionId: string,
    connectionNoteId: string,
    note: ConnectionNoteProps
  ) {
    await this.props.signifyClient.contacts().update(connectionId, {
      [connectionNoteId]: JSON.stringify(note),
    });
  }

  async deleteConnectionNoteById(
    connectionId: string,
    connectionNoteId: string
  ) {
    return this.props.signifyClient.contacts().update(connectionId, {
      [connectionNoteId]: null,
    });
  }

  @OnlineOnly
  async getOobi(id: string, alias?: string, groupId?: string): Promise<string> {
    const result = await this.props.signifyClient.oobis().get(id);

    if (!result.oobis[0]) {
      throw new Error(ConnectionService.CANNOT_GET_OOBI);
    }
    const oobi = new URL(result.oobis[0]);
    const identifier = await this.props.signifyClient.identifiers().get(id);
    //This condition is used for multi-sig oobi
    if (identifier && identifier.group) {
      const pathName = oobi.pathname;
      const agentIndex = pathName.indexOf("/agent/");
      if (agentIndex !== -1) {
        oobi.pathname = pathName.substring(0, agentIndex);
      }
    }
    if (alias !== undefined) oobi.searchParams.set("name", alias);
    if (groupId !== undefined) oobi.searchParams.set("groupId", groupId);
    return oobi.toString();
  }

  private async createConnectionMetadata(
    connectionId: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    await this.connectionStorage.save({
      id: connectionId,
      alias: metadata.alias as string,
      oobi: metadata.oobi as string,
      groupId: metadata.groupId as string,
      pending: !!metadata.pending,
      createdAt: new Date(metadata.createdAtUTC as string),
    });
  }

  private async getConnectionMetadataById(
    connectionId: string
  ): Promise<ConnectionRecord> {
    const connection = await this.connectionStorage.findById(connectionId);
    if (!connection) {
      throw new Error(ConnectionService.CONNECTION_METADATA_RECORD_NOT_FOUND);
    }
    return connection;
  }

  // @TODO - foconnor: Contacts that are smid/rmids for multisigs will be synced too.
  @OnlineOnly
  async syncKeriaContacts() {
    const signifyContacts = await this.props.signifyClient.contacts().list();
    const storageContacts = await this.connectionStorage.getAll();
    const unSyncedData = signifyContacts.filter(
      (contact: Contact) =>
        !storageContacts.find((item: ConnectionRecord) => contact.id == item.id)
    );
    if (unSyncedData.length) {
      //sync the storage with the signify data
      for (const contact of unSyncedData) {
        await this.createConnectionMetadata(contact.id, {
          alias: contact.alias,
          oobi: contact.oobi,
          groupId: contact.groupCreationId,
          createdAtUTC: contact.createdAt,
        });
      }
    }
  }

  @OnlineOnly
  async resolveOobi(
    url: string,
    waitForCompletion = true
  ): Promise<{
    op: Operation & { response: State };
    alias: string;
  }> {
    const alias = new URL(url).searchParams.get("name") ?? randomSalt();
    let operation: Operation & { response: State };
    if (waitForCompletion) {
      operation = (await waitAndGetDoneOp(
        this.props.signifyClient,
        await this.props.signifyClient.oobis().resolve(url, alias),
        5000
      )) as Operation & { response: State };
      if (!operation.done) {
        throw new Error(ConnectionService.FAILED_TO_RESOLVE_OOBI);
      }
      if (operation.response && operation.response.i) {
        const connectionId = operation.response.i;
        await this.props.signifyClient.contacts().update(connectionId, {
          alias,
          groupCreationId: new URL(url).searchParams.get("groupId") ?? "",
          createdAt: new Date().toISOString(),
        });
      }
    } else {
      operation = await this.props.signifyClient.oobis().resolve(url, alias);
      const pendingOperation = await this.operationPendingStorage.save({
        id: operation.name,
        recordType: OperationPendingRecordType.Oobi,
      });
      this.props.eventEmitter.emit<OperationAddedEvent>({
        type: EventTypes.OperationAdded,
        payload: { operation: pendingOperation },
      });
    }
    return { op: operation, alias };
  }

  async removeConnectionsPendingDeletion() {
    const pendingDeletions = await this.getConnectionsPendingDeletion();
    for (const id of pendingDeletions) {
      await this.deleteConnectionById(id);
    }

    return pendingDeletions;
  }

  async resolvePendingConnections() {
    const pendingConnections = await this.getConnectionsPending();
    for (const pendingConnection of pendingConnections) {
      await this.resolveOobi(pendingConnection.oobi);
    }
  }
}

export { ConnectionService };
