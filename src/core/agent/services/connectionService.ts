import { v4 as uuidv4 } from "uuid";
import {
  ConnectionDetails,
  ConnectionHistoryItem,
  ConnectionHistoryType,
  ConnectionKeriEventTypes,
  ConnectionKeriStateChangedEvent,
  ConnectionNoteDetails,
  ConnectionNoteProps,
  ConnectionShortDetails,
  ConnectionStatus,
} from "../agent.types";
import { AgentService } from "./agentService";
import { Agent } from "../agent";
import { KeriContact } from "../modules/signify/signifyApi.types";
import { BasicRecord } from "../records";
import { RecordType } from "../../storage/storage.types";

class ConnectionService extends AgentService {
  // static readonly NOT_FOUND_DOMAIN_CONFIG_ERROR_MSG =
  //   "No domain found in config";
  static readonly COULD_NOT_CREATE_OOB_VIA_MEDIATOR =
    "Could not create new mediator oob invitation";
  static readonly INVALID_CONNECTIONLESS_MSG =
    "Invalid connectionless OOBI - does not contain d_m parameter";
  static readonly CONNECTION_NOTE_RECORD_NOT_FOUND =
    "Connection note record not found";
  static readonly CONNECTION_KERI_METADATA_RECORD_NOT_FOUND =
    "Connection keri metadata record not found";

  onConnectionKeriStateChanged(
    callback: (event: ConnectionKeriStateChangedEvent) => void
  ) {
    this.eventService.on(
      ConnectionKeriEventTypes.ConnectionKeriStateChanged,
      async (event: ConnectionKeriStateChangedEvent) => {
        callback(event);
      }
    );
  }

  async receiveInvitationFromUrl(url: string): Promise<void> {
    this.eventService.emit<ConnectionKeriStateChangedEvent>({
      type: ConnectionKeriEventTypes.ConnectionKeriStateChanged,
      payload: {
        connectionId: undefined,
        status: ConnectionStatus.PENDING,
      },
    });
    const operation = await this.signifyApi.resolveOobi(url);
    const connectionId = operation.response.i;
    await this.createConnectionKeriMetadata(connectionId, {
      alias: operation.alias,
      oobi: url,
    });

    // @TODO - foconnor: This is temporary for ease of development, will be removed soon.
    // This will take our first KERI identifier and get the server to resolve it, so that the connection is resolved from both sides and we can issue to this wallet using its API.
    if (url.includes("dev.keria.cf-keripy.metadata.dev.cf-deployments.org")) {
      // This is inefficient but it will change going forward.
      const aids = await Agent.agent.identifiers.getIdentifiers();
      if (aids.length > 0) {
        const oobi = await Agent.agent.connections.getKeriOobi(
          aids[0].signifyName
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

    return this.eventService.emit<ConnectionKeriStateChangedEvent>({
      type: ConnectionKeriEventTypes.ConnectionKeriStateChanged,
      payload: {
        connectionId: operation.response.i,
        status: ConnectionStatus.CONFIRMED,
      },
    });
  }

  async getConnections(): Promise<ConnectionShortDetails[]> {
    const connectionsDetails: ConnectionShortDetails[] = [];
    const connectionKeriMetadatas = await this.getAllConnectionKeriMetadata();
    connectionKeriMetadatas.forEach(async (connection) => {
      connectionsDetails.push(this.getConnectionKeriShortDetails(connection));
    });
    return connectionsDetails;
  }

  private getConnectionKeriShortDetails(
    record: BasicRecord
  ): ConnectionShortDetails {
    return {
      id: record.id,
      label: record.content?.alias as string,
      connectionDate: record.createdAt.toISOString(),
      status: ConnectionStatus.CONFIRMED,
      oobi: record.content?.oobi as string,
    };
  }

  async getConnectionById(id: string): Promise<ConnectionDetails> {
    const connection = await this.signifyApi.getContactById(id);
    return {
      label: connection?.alias,
      id: connection.id,
      status: ConnectionStatus.CONFIRMED,
      connectionDate: (
        await this.getConnectionKeriMetadataById(connection.id)
      ).createdAt.toISOString(),
      serviceEndpoints: [connection.oobi],
      notes: await this.getConnectNotesByConnectionId(connection.id),
    };
  }

  async deleteConnectionById(id: string): Promise<void> {
    await this.basicStorage.deleteById(id);
    // await this.signifyApi.deleteContactById(id); TODO: must open when Keria runs well
    const notes = await this.getConnectNotesByConnectionId(id);
    for (const note of notes) {
      this.basicStorage.deleteById(note.id);
    }
  }

  async getConnectionKeriShortDetailById(
    id: string
  ): Promise<ConnectionShortDetails> {
    const metadata = await this.getConnectionKeriMetadataById(id);
    return this.getConnectionKeriShortDetails(metadata);
  }

  async createConnectionNote(
    connectionId: string,
    note: ConnectionNoteProps
  ): Promise<void> {
    await this.basicStorage.save({
      id: uuidv4(),
      content: note,
      type: RecordType.CONNECTION_NOTE,
      tags: {
        connectionId,
      },
    });
  }

  async updateConnectionNoteById(
    connectionNoteId: string,
    note: ConnectionNoteProps
  ) {
    const noteRecord = await this.basicStorage.findById(connectionNoteId);
    if (!noteRecord) {
      throw new Error(ConnectionService.CONNECTION_NOTE_RECORD_NOT_FOUND);
    }
    noteRecord.content = note;
    await this.basicStorage.update(noteRecord);
  }

  async deleteConnectionNoteById(connectionNoteId: string) {
    return this.basicStorage.deleteById(connectionNoteId);
  }

  async getKeriOobi(signifyName: string, alias?: string): Promise<string> {
    const oobi = await this.signifyApi.getOobi(signifyName);
    return alias ? `${oobi}?name=${encodeURIComponent(alias)}` : oobi;
  }

  private async createConnectionKeriMetadata(
    connectionId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.basicStorage.save({
      id: connectionId,
      content: metadata || {},
      type: RecordType.CONNECTION_KERI_METADATA,
      tags: {
        type: RecordType.CONNECTION_KERI_METADATA,
      },
    });
  }

  private async getConnectionKeriMetadataById(
    connectionId: string
  ): Promise<BasicRecord> {
    const connectionKeri = await this.basicStorage.findById(connectionId);
    if (!connectionKeri) {
      throw new Error(
        ConnectionService.CONNECTION_KERI_METADATA_RECORD_NOT_FOUND
      );
    }
    return connectionKeri;
  }

  async getAllConnectionKeriMetadata(): Promise<BasicRecord[]> {
    const connectionKeris = await this.basicStorage.getAll(
      RecordType.CONNECTION_KERI_METADATA
    );
    return connectionKeris;
  }

  async getConnectionHistoryById(
    connectionId: string
  ): Promise<ConnectionHistoryItem[]> {
    let histories: ConnectionHistoryItem[] = [];
    const credentialRecords =
      await Agent.agent.credentials.getCredentialMetadataByConnectionId(
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

  async syncKeriaContacts() {
    const signifyContacts = await this.signifyApi.getContacts();
    const storageContacts = await this.getAllConnectionKeriMetadata();
    const unSyncedData = signifyContacts.filter(
      (contact: KeriContact) =>
        !storageContacts.find((item: BasicRecord) => contact.id == item.id)
    );
    if (unSyncedData.length) {
      //sync the storage with the signify data
      for (const contact of unSyncedData) {
        await this.createConnectionKeriMetadata(contact.id, {
          alias: contact.alias,
          oobi: contact.oobi,
        });
      }
    }
  }

  private async getConnectNotesByConnectionId(
    connectionId: string
  ): Promise<ConnectionNoteDetails[]> {
    const notes = await this.basicStorage.findAllByQuery(
      RecordType.CONNECTION_NOTE,
      {
        connectionId,
      }
    );
    return notes.map((note) => {
      return {
        id: note.id,
        title: note.content.title as string,
        message: note.content.message as string,
      };
    });
  }
}

export { ConnectionService };
