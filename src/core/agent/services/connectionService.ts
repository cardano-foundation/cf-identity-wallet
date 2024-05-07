import { v4 as uuidv4 } from "uuid";
import {
  ConnectionDetails,
  ConnectionHistoryItem,
  ConnectionEventTypes,
  ConnectionStateChangedEvent,
  ConnectionNoteDetails,
  ConnectionNoteProps,
  ConnectionShortDetails,
  ConnectionStatus,
  AgentServicesProps,
  OobiScan,
  KeriConnectionType,
} from "../agent.types";
import { AgentService } from "./agentService";
import { Agent } from "../agent";
import {
  ConnectionNoteStorage,
  ConnectionRecord,
  CredentialStorage,
  ConnectionStorage,
} from "../records";
import { PreferencesKeys, PreferencesStorage } from "../../storage";
import { waitAndGetDoneOp } from "./utils";
import { ConnectionHistoryType, KeriaContact } from "./connection.types";

class ConnectionService extends AgentService {
  protected readonly connectionStorage!: ConnectionStorage;
  protected readonly connectionNoteStorage!: ConnectionNoteStorage;
  protected readonly credentialStorage: CredentialStorage;

  constructor(
    agentServiceProps: AgentServicesProps,
    connectionStorage: ConnectionStorage,
    connectionNoteStorage: ConnectionNoteStorage,
    credentialStorage: CredentialStorage
  ) {
    super(agentServiceProps);
    this.connectionStorage = connectionStorage;
    this.connectionNoteStorage = connectionNoteStorage;
    this.credentialStorage = credentialStorage;
  }

  static readonly CONNECTION_NOTE_RECORD_NOT_FOUND =
    "Connection note record not found";
  static readonly CONNECTION_METADATA_RECORD_NOT_FOUND =
    "Connection metadata record not found";
  static readonly DEFAULT_ROLE = "agent";
  static readonly FAILED_TO_RESOLVE_OOBI =
    "Failed to resolve OOBI, operation not completing...";

  static resolvedOobi: { [key: string]: any } = {};

  onConnectionStateChanged(
    callback: (event: ConnectionStateChangedEvent) => void
  ) {
    this.eventService.on(
      ConnectionEventTypes.ConnectionStateChanged,
      async (event: ConnectionStateChangedEvent) => {
        callback(event);
      }
    );
  }

  async connectByOobiUrl(url: string): Promise<OobiScan> {
    const multiSigInvite = url.includes("groupId");

    // @TODO - foconnor: We shouldn't emit this if it's a multiSigInvite, but the routing will break if we don't.
    // To fix once we handle errors for the scanner in general.
    this.eventService.emit<ConnectionStateChangedEvent>({
      type: ConnectionEventTypes.ConnectionStateChanged,
      payload: {
        connectionId: undefined,
        status: ConnectionStatus.PENDING,
      },
    });

    const operation = await this.resolveOobi(url);
    const connectionId = operation.response.i;
    const connectionMetadata: any = {
      alias: operation.alias,
      oobi: url,
    };

    if (multiSigInvite) {
      const groupId = new URL(url).searchParams.get("groupId") ?? "";
      connectionMetadata.groupId = groupId;
      const identifierWithGroupId =
        await Agent.agent.identifiers.getKeriIdentifierByGroupId(groupId);

      // This allows the calling function to create our smid/rmid member identifier.
      // We let the UI handle it as it requires some metadata from the user like display name.
      if (!identifierWithGroupId) {
        await this.createConnectionMetadata(connectionId, connectionMetadata);
        return { type: KeriConnectionType.MULTI_SIG_INITIATOR, groupId };
      }
    }
    await this.createConnectionMetadata(connectionId, connectionMetadata);

    // @TODO - foconnor: This is temporary for ease of development, will be removed soon.
    // This will take our first KERI identifier and get the server to resolve it, so that the connection is resolved from both sides and we can issue to this wallet using its API.
    if (url.includes("dev.keria.cf-keripy.metadata.dev.cf-deployments.org")) {
      // This is inefficient but it will change going forward.
      const aids = await Agent.agent.identifiers.getIdentifiers();
      if (aids.length > 0) {
        let userName;
        try {
          userName = (
            await PreferencesStorage.get(PreferencesKeys.APP_USER_NAME)
          ).userName as string;
        } catch (error) {
          if (
            (error as Error).message !==
            `${PreferencesStorage.KEY_NOT_FOUND} ${PreferencesKeys.APP_USER_NAME}`
          ) {
            throw error;
          }
        }

        // signifyName should always be set
        const oobi = await Agent.agent.connections.getOobi(
          aids[0].signifyName,
          userName
        );
        await (
          await fetch(
            "https://dev.credentials.cf-keripy.metadata.dev.cf-deployments.org/resolveOobi",
            {
              method: "POST",
              body: JSON.stringify({ oobi }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
        ).json();
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          "Please create a KERI AID first before scanning an OOBI of the deployed server, if you wish to be issued an ACDC automatically."
        );
      }
    }

    if (!multiSigInvite) {
      this.eventService.emit<ConnectionStateChangedEvent>({
        type: ConnectionEventTypes.ConnectionStateChanged,
        payload: {
          connectionId: operation.response.i,
          status: ConnectionStatus.CONFIRMED,
        },
      });
    }
    return { type: KeriConnectionType.NORMAL };
  }

  async getConnections(): Promise<ConnectionShortDetails[]> {
    const connectionsDetails: ConnectionShortDetails[] = [];
    const metadatas = await this.getAllConnectionMetadata();
    metadatas.forEach(async (connection) => {
      // @TODO - foconnor: This filter should be via the SQL, may cause a regression so this is a temp solution.
      if (connection.getTag("groupId") === undefined) {
        connectionsDetails.push(this.getConnectionShortDetails(connection));
      }
    });
    return connectionsDetails;
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
      status: ConnectionStatus.CONFIRMED,
      oobi: record.oobi,
    };
    const groupId = record.getTag("groupId");
    if (groupId) {
      connection.groupId = groupId as string;
    }
    return connection;
  }

  async getConnectionById(id: string): Promise<ConnectionDetails> {
    const connection = await this.signifyClient.contacts().get(id);
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

  async deleteConnectionById(id: string): Promise<void> {
    await this.connectionStorage.deleteById(id);
    // await this.signifyApi.deleteContactById(id); @TODO - foconnor: Uncomment when KERIA endpoint fixed
    const notes = await this.getConnectNotesByConnectionId(id);
    for (const note of notes) {
      this.connectionNoteStorage.deleteById(note.id);
    }
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

  async getOobi(
    signifyName: string,
    alias?: string,
    groupId?: string
  ): Promise<string> {
    const result = await this.signifyClient
      .oobis()
      .get(signifyName, ConnectionService.DEFAULT_ROLE);
    const oobi = new URL(result.oobis[0]);
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

  async getAllConnectionMetadata(): Promise<ConnectionRecord[]> {
    return this.connectionStorage.getAll();
  }

  async getConnectionHistoryById(
    connectionId: string
  ): Promise<ConnectionHistoryItem[]> {
    let histories: ConnectionHistoryItem[] = [];
    const credentialRecords =
      await this.credentialStorage.getCredentialMetadataByConnectionId(
        connectionId
      );
    histories = histories.concat(
      credentialRecords.map((record) => {
        return {
          type: ConnectionHistoryType.CREDENTIAL_ACCEPTED,
          timestamp: record.createdAt.toISOString(),
          credentialType: record.credentialType,
        };
      })
    );
    return histories;
  }

  // @TODO - foconnor: Contacts that are smid/rmids for multisigs will be synced too.
  async syncKeriaContacts() {
    const signifyContacts = await this.signifyClient.contacts().list();
    const storageContacts = await this.getAllConnectionMetadata();
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

  async resolveOobi(url: string): Promise<any> {
    if (ConnectionService.resolvedOobi[url]) {
      return ConnectionService.resolvedOobi[url];
    }
    const alias = new URL(url).searchParams.get("name") ?? uuidv4();
    const operation = await waitAndGetDoneOp(
      this.signifyClient,
      await this.signifyClient.oobis().resolve(url, alias)
    );
    if (!operation.done) {
      throw new Error(ConnectionService.FAILED_TO_RESOLVE_OOBI);
    }
    const oobi = { ...operation, alias };
    ConnectionService.resolvedOobi[url] = oobi;
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
