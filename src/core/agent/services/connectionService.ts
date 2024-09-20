import { v4 as uuidv4 } from "uuid";
import { SqliteStorage } from "../../storage/sqliteStorage";
import { Agent } from "../agent";
import {
  AgentServicesProps,
  ConnectionDetails,
  ConnectionHistoryItem,
  ConnectionNoteDetails,
  ConnectionNoteProps,
  ConnectionShortDetails,
  ConnectionStatus,
  KeriConnectionType,
  OobiScan,
} from "../agent.types";
import {
  ConnectionNoteStorage,
  ConnectionRecord,
  ConnectionStorage,
  CredentialStorage,
  IpexMessageStorage,
  OperationPendingStorage,
} from "../records";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { AgentService } from "./agentService";
import { KeriaContact } from "./connection.types";
import { OnlineOnly, waitAndGetDoneOp } from "./utils";
import { StorageMessage } from "../../storage/storage.types";
import { ConnectionStateChangedEvent, EventTypes } from "../event.types";

class ConnectionService extends AgentService {
  protected readonly connectionStorage!: ConnectionStorage;
  protected readonly connectionNoteStorage!: ConnectionNoteStorage;
  protected readonly credentialStorage: CredentialStorage;
  protected readonly ipexMessageStorage: IpexMessageStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;

  constructor(
    agentServiceProps: AgentServicesProps,
    connectionStorage: ConnectionStorage,
    connectionNoteStorage: ConnectionNoteStorage,
    credentialStorage: CredentialStorage,
    ipexMessageStorage: IpexMessageStorage,
    operationPendingStorage: OperationPendingStorage
  ) {
    super(agentServiceProps);
    this.connectionStorage = connectionStorage;
    this.connectionNoteStorage = connectionNoteStorage;
    this.credentialStorage = credentialStorage;
    this.ipexMessageStorage = ipexMessageStorage;
    this.operationPendingStorage = operationPendingStorage;
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
    this.props.eventService.on(EventTypes.ConnectionStateChanged, callback);
  }

  @OnlineOnly
  async connectByOobiUrl(url: string): Promise<OobiScan> {
    const multiSigInvite = url.includes("groupId");

    // @TODO - foconnor: We shouldn't emit this if it's a multiSigInvite, but the routing will break if we don't.
    // To fix once we handle errors for the scanner in general.
    this.props.eventService.emit<ConnectionStateChangedEvent>({
      type: EventTypes.ConnectionStateChanged,
      payload: {
        isMultiSigInvite: multiSigInvite,
        connectionId: undefined,
        status: ConnectionStatus.PENDING,
      },
    });

    const operation = await this.resolveOobi(url, multiSigInvite);
    const connectionId =
      operation.done && operation.response
        ? operation.response.i
        : new URL(url).pathname.split("/oobi/").pop()?.split("/")[0];
    const connectionMetadata: any = {
      alias: operation.alias,
      oobi: url,
      pending: !operation.done,
    };
    const groupId = new URL(url).searchParams.get("groupId") ?? "";
    const connectionDate = operation.response?.dt ?? new Date();
    const connection = {
      id: connectionId,
      connectionDate,
      oobi: operation.metadata.oobi,
      status: ConnectionStatus.CONFIRMED,
      label: operation.alias,
      groupId,
    };

    if (multiSigInvite) {
      connectionMetadata.groupId = groupId;
      const identifierWithGroupId =
        await Agent.agent.identifiers.getKeriIdentifierByGroupId(groupId);

      // This allows the calling function to create our smid/rmid member identifier.
      // We let the UI handle it as it requires some metadata from the user like display name.
      if (!identifierWithGroupId) {
        await this.createConnectionMetadata(
          connectionId,
          connectionMetadata
        ).catch((error) => {
          if (
            !(error instanceof Error) ||
            !error.message.includes(
              StorageMessage.RECORD_DOES_NOT_EXIST_ERROR_MSG
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
    }
    await this.createConnectionMetadata(connectionId, connectionMetadata);

    if (!multiSigInvite) {
      this.props.eventService.emit<ConnectionStateChangedEvent>({
        type: EventTypes.ConnectionStateChanged,
        payload: {
          connectionId,
          status: ConnectionStatus.CONFIRMED,
        },
      });
    }
    return { type: KeriConnectionType.NORMAL, connection };
  }

  async getConnections(): Promise<ConnectionShortDetails[]> {
    const connections = await this.connectionStorage.findAllByQuery({
      groupId: undefined,
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
    });
    associatedContacts.forEach(async (connection) => {
      connectionsDetails.push(this.getConnectionShortDetails(connection));
    });
    return connectionsDetails;
  }

  private getConnectionShortDetails(
    record: ConnectionRecord
  ): ConnectionShortDetails {
    const connection: ConnectionShortDetails = {
      id: record.id,
      label: record.alias,
      connectionDate: record.createdAt.toISOString(),
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
    return {
      label: connection?.alias,
      id: connection.id,
      status: ConnectionStatus.CONFIRMED,
      connectionDate: (
        await this.getConnectionMetadataById(connection.id)
      ).createdAt.toISOString(),
      serviceEndpoints: [connection.oobi],
      notes: await this.getConnectNotesByConnectionId(connection.id),
    };
  }

  @OnlineOnly
  async deleteConnectionById(id: string): Promise<void> {
    await this.props.signifyClient.contacts().delete(id);
    await this.connectionStorage.deleteById(id);
    const notes = await this.getConnectNotesByConnectionId(id);
    await Promise.all(
      notes.map((note) => this.connectionNoteStorage.deleteById(note.id))
    );
    const historyItems =
      await this.ipexMessageStorage.getIpexMessageMetadataByConnectionId(id);
    await Promise.all(
      historyItems.map((historyItem) =>
        this.ipexMessageStorage.deleteIpexMessageMetadata(historyItem.id)
      )
    );
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
    await this.connectionNoteStorage.save({
      id: uuidv4(),
      title: note.title,
      message: note.message,
      connectionId,
    });
  }

  async updateConnectionNoteById(
    connectionNoteId: string,
    note: ConnectionNoteProps
  ) {
    const noteRecord = await this.connectionNoteStorage.findById(
      connectionNoteId
    );
    if (!noteRecord) {
      throw new Error(ConnectionService.CONNECTION_NOTE_RECORD_NOT_FOUND);
    }
    noteRecord.title = note.title;
    noteRecord.message = note.message;
    await this.connectionNoteStorage.update(noteRecord);
  }

  async deleteConnectionNoteById(connectionNoteId: string) {
    return this.connectionNoteStorage.deleteById(connectionNoteId);
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

  async getConnectionHistoryById(
    connectionId: string
  ): Promise<ConnectionHistoryItem[]> {
    const linkedIpexMessages =
      await this.ipexMessageStorage.getIpexMessageMetadataByConnectionId(
        connectionId
      );
    const requestMessages = linkedIpexMessages
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((messageRecord) => {
        const { historyType, createdAt, credentialType } = messageRecord;
        return {
          type: historyType,
          timestamp: createdAt.toISOString(),
          credentialType,
        };
      });
    return requestMessages;
  }

  // @TODO - foconnor: Contacts that are smid/rmids for multisigs will be synced too.
  @OnlineOnly
  async syncKeriaContacts() {
    const signifyContacts = await this.props.signifyClient.contacts().list();
    const storageContacts = await this.connectionStorage.getAll();
    const unSyncedData = signifyContacts.filter(
      (contact: KeriaContact) =>
        !storageContacts.find((item: ConnectionRecord) => contact.id == item.id)
    );
    if (unSyncedData.length) {
      //sync the storage with the signify data
      for (const contact of unSyncedData) {
        await this.createConnectionMetadata(contact.id, {
          alias: contact.alias,
          oobi: contact.oobi,
        });
      }
    }
  }

  @OnlineOnly
  async resolveOobi(url: string, waitForCompletion = true): Promise<any> {
    const startTime = Date.now();
    const alias = new URL(url).searchParams.get("name") ?? uuidv4();
    let operation;
    if (waitForCompletion) {
      operation = await waitAndGetDoneOp(
        this.props.signifyClient,
        await this.props.signifyClient.oobis().resolve(url, alias),
        5000
      );
    } else {
      operation = await waitAndGetDoneOp(
        this.props.signifyClient,
        await this.props.signifyClient.oobis().resolve(url, alias),
        2000 - (Date.now() - startTime)
      );
    }
    if (!operation.done && !waitForCompletion) {
      const pendingOperation = await this.operationPendingStorage.save({
        id: operation.name,
        recordType: OperationPendingRecordType.Oobi,
      });
      Agent.agent.keriaNotifications.addPendingOperationToQueue(
        pendingOperation
      );
    } else if (!operation.done) {
      throw new Error(ConnectionService.FAILED_TO_RESOLVE_OOBI);
    }
    const oobi = { ...operation, alias };
    return oobi;
  }

  private async getConnectNotesByConnectionId(
    connectionId: string
  ): Promise<ConnectionNoteDetails[]> {
    const notes = await this.connectionNoteStorage.findAllByQuery({
      connectionId,
    });
    return notes.map((note) => {
      return {
        id: note.id,
        title: note.title,
        message: note.message,
      };
    });
  }
}

export { ConnectionService };
