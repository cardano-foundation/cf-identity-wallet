import {
  AriesFrameworkError,
  ConnectionEventTypes,
  ConnectionRecord,
  ConnectionStateChangedEvent,
  ConnectionType as AriesConnectionType,
  DidExchangeRole,
  DidExchangeState,
  JsonEncoder,
  OutOfBandDidCommService,
  OutOfBandRecord,
  utils,
} from "@aries-framework/core";
import {
  ConnectionDetails,
  ConnectionHistoryItem,
  ConnectionHistoryType,
  ConnectionKeriEventTypes,
  ConnectionKeriStateChangedEvent,
  ConnectionNoteDetails,
  ConnectionNoteProps,
  ConnectionShortDetails,
  ConnectionType,
  ConnectionStatus,
} from "../agent.types";
import { AgentService } from "./agentService";
import { KeriContact } from "../modules/signify/signifyApi.types";
import { AriesAgent } from "../agent";
import { IdentifierType } from "./identifierService.types";
import { PreferencesKeys, PreferencesStorage } from "../../storage";
import { BasicRecord, RecordType } from "../../storage/storage.types";
import { ConfigurationService } from "../../configuration";

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

  onConnectionStateChanged(
    callback: (event: ConnectionStateChangedEvent) => void
  ) {
    this.agent.events.on(
      ConnectionEventTypes.ConnectionStateChanged,
      async (event: ConnectionStateChangedEvent) => {
        callback(event);
      }
    );
  }

  onConnectionKeriStateChanged(
    callback: (event: ConnectionKeriStateChangedEvent) => void
  ) {
    this.agent.events.on(
      ConnectionKeriEventTypes.ConnectionKeriStateChanged,
      async (event: ConnectionKeriStateChangedEvent) => {
        callback(event);
      }
    );
  }

  /**
   * Role: Responder, Check to see if there are incoming connection requests
   * @param connectionRecord
   */
  isConnectionRequestReceived(connectionRecord: ConnectionRecord) {
    return (
      connectionRecord.role === DidExchangeRole.Responder &&
      connectionRecord.state === DidExchangeState.RequestReceived &&
      !connectionRecord.autoAcceptConnection
    );
  }

  /**
   * Role: Responder, after accepted incoming connection requests
   * @param connectionRecord
   */
  isConnectionResponseSent(connectionRecord: ConnectionRecord) {
    return (
      connectionRecord.role === DidExchangeRole.Responder &&
      connectionRecord.state === DidExchangeState.ResponseSent
    );
  }

  /**
   * Role: invitee
   * @param connectionRecord
   */
  isConnectionRequestSent(connectionRecord: ConnectionRecord) {
    return (
      connectionRecord.role === DidExchangeRole.Requester &&
      connectionRecord.state === DidExchangeState.RequestSent
    );
  }

  /**
   * Role: invitee
   * @param connectionRecord
   */
  isConnectionResponseReceived(connectionRecord: ConnectionRecord) {
    return (
      connectionRecord.role === DidExchangeRole.Requester &&
      connectionRecord.state === DidExchangeState.ResponseReceived &&
      !connectionRecord.autoAcceptConnection
    );
  }

  /**
   * Role: invitee, inviter
   * @param connectionRecord
   */
  isConnectionConnected(connectionRecord: ConnectionRecord) {
    return connectionRecord.state === DidExchangeState.Completed;
  }

  async resolveOObi(url: string, name: string): Promise<void> {
    const resolvedOobi = await this.signifyApi.resolveOobi(url);
    let resolvedOobis: Record<string, any> = {};
    try {
      const storedResolvedOobis = await PreferencesStorage.get(
        PreferencesKeys.APP_TUNNEL_CONNECT
      );
      resolvedOobis = storedResolvedOobis || {};
    } catch (e) {
      // TODO: handle error
    }

    resolvedOobis[resolvedOobi.response.i] = {
      url,
      name,
      dt: resolvedOobi.response.dt,
    };
    await PreferencesStorage.set(
      PreferencesKeys.APP_TUNNEL_CONNECT,
      resolvedOobis
    );
  }
  async receiveInvitationFromUrl(url: string): Promise<void> {
    if (url.includes("/oobi")) {
      this.agent.events.emit<ConnectionKeriStateChangedEvent>(
        this.agent.context,
        {
          type: ConnectionKeriEventTypes.ConnectionKeriStateChanged,
          payload: {
            connectionId: undefined,
            status: ConnectionStatus.PENDING,
          },
        }
      );

      const operation = await this.signifyApi.resolveOobi(url);
      const connectionId = operation.response.i;
      await this.createConnectionKeriMetadata(connectionId, {
        alias: operation.alias,
        oobi: url,
      });

      // @TODO - foconnor: This is temporary for ease of development, will be removed soon.
      // This will take our first KERI identifier and get the server to resolve it, so that the connection is resolved from both sides and we can issue to this wallet using its API.
      if (
        url.includes(
          ConfigurationService.env.keri.credentials.testServer.oobiUrl
        )
      ) {
        // This is inefficient but it will change going forward.
        const aid = (await AriesAgent.agent.identifiers.getIdentifiers()).find(
          (identifier) =>
            identifier.method === IdentifierType.KERI &&
            identifier.isPending === false &&
            identifier.displayName === "Demo"
        );
        if (aid && aid.signifyName) {
          let userName;
          try {
            userName = (
              await PreferencesStorage.get(PreferencesKeys.APP_USER_NAME)
            ).userName as string;
          } catch (error) {
            if (
              (error as Error).message !==
              `${PreferencesStorage.KEY_NOT_FOUND} ${PreferencesKeys.APP_TUNNEL_CONNECT}`
            ) {
              throw error;
            }
          }

          // signifyName should always be set
          const oobi = await AriesAgent.agent.connections.getKeriOobi(
            aid.signifyName,
            userName
          );
          await (
            await fetch(
              `${ConfigurationService.env.keri.credentials.testServer.urlExt}/resolveOobi`,
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

      return this.agent.events.emit<ConnectionKeriStateChangedEvent>(
        this.agent.context,
        {
          type: ConnectionKeriEventTypes.ConnectionKeriStateChanged,
          payload: {
            connectionId: operation.response.i,
            status: ConnectionStatus.CONFIRMED,
          },
        }
      );
    }
    if (url.includes("/shorten")) {
      const response = await this.fetchShortUrl(url);
      url = await response.text();
    }
    await this.agent.oob.receiveInvitationFromUrl(url, {
      autoAcceptConnection: false,
      autoAcceptInvitation: true,
      reuseConnection: true,
    });
  }

  // @TODO: this is a temporary feature, an api should be added in the mediator to get the shorten url
  async getShortenUrl(invitationUrl: string): Promise<string> {
    const getUrl = await fetch(
      `${ConfigurationService.env.keri.credentials.testServer.urlExt}/shorten`,
      {
        method: "POST",
        body: JSON.stringify({ url: invitationUrl }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const response = await getUrl.text();
    return JsonEncoder.fromString(response).data;
  }

  async acceptRequestConnection(connectionId: string) {
    await this.agent.connections.acceptRequest(connectionId);
  }

  async acceptResponseConnection(connectionId: string) {
    await this.agent.connections.acceptResponse(connectionId);
  }

  async createMediatorInvitation() {
    const record = await this.agent.oob.createInvitation();
    if (!record) {
      throw new Error(ConnectionService.COULD_NOT_CREATE_OOB_VIA_MEDIATOR);
    }

    const invitationUrl = record.outOfBandInvitation.toUrl({
      domain: "didcomm://invite",
    });

    return {
      record,
      invitation: record.outOfBandInvitation,
      invitationUrl,
    };
  }

  private isMediatorConnection(connection: ConnectionRecord) {
    return connection.connectionTypes.includes(AriesConnectionType.Mediator);
  }

  async getConnections(): Promise<ConnectionShortDetails[]> {
    const connections = await this.agent.connections.getAll();
    const connectionsDetails: ConnectionShortDetails[] = [];
    connections.forEach((connection) => {
      if (this.isMediatorConnection(connection)) {
        return;
      }
      connectionsDetails.push(this.getConnectionShortDetails(connection));
    });
    const connectionKeriMetadatas = await this.getAllConnectionKeriMetadata();
    connectionKeriMetadatas.forEach(async (connection) => {
      connectionsDetails.push(this.getConnectionKeriShortDetails(connection));
    });
    return connectionsDetails;
  }

  getConnectionShortDetails(
    connection: ConnectionRecord
  ): ConnectionShortDetails {
    return {
      id: connection.id,
      label: connection.theirLabel ?? "",
      connectionDate: connection.createdAt.toISOString(),
      logo: connection.imageUrl,
      status:
        connection.state === DidExchangeState.Completed
          ? ConnectionStatus.CONFIRMED
          : ConnectionStatus.PENDING,
      type: ConnectionType.DIDCOMM,
    };
  }

  private getConnectionKeriShortDetails(
    record: BasicRecord
  ): ConnectionShortDetails {
    return {
      id: record.id,
      label: record.content?.alias as string,
      connectionDate: record.createdAt.toISOString(),
      status: ConnectionStatus.CONFIRMED,
      type: ConnectionType.KERI,
      oobi: record.content?.oobi as string,
    };
  }

  async getConnectionById(
    id: string,
    type?: ConnectionType
  ): Promise<ConnectionDetails> {
    if (type === ConnectionType.KERI) {
      return this.getKeriConnectionDetails(id);
    }
    const connection = await this.agent.connections.getById(id);
    let outOfBandRecord: OutOfBandRecord | undefined;
    if (connection.outOfBandId) {
      outOfBandRecord = await this.agent.oob.getById(connection.outOfBandId);
    }
    return this.getConnectionDetails(connection, outOfBandRecord);
  }

  async deleteConnectionById(
    id: string,
    connectionType?: ConnectionType
  ): Promise<void> {
    if (connectionType === ConnectionType.KERI) {
      await this.basicStorage.deleteById(id);
      // @TODO - foconnor: Deleting contact by ID throwing an error in KERIA right now, disabling temp...
      // await this.signifyApi.deleteContactById(id);
    } else {
      await this.agent.connections.deleteById(id);
    }
    const notes = await this.getConnectNotesByConnectionId(id);
    for (const note of notes) {
      this.basicStorage.deleteById(note.id);
    }
  }

  async getConnectionShortDetailById(
    id: string
  ): Promise<ConnectionShortDetails> {
    const connection = await this.agent.connections.getById(id);
    return this.getConnectionShortDetails(connection);
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
      id: utils.uuid(),
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
      await this.agent.modules.generalStorage.getCredentialMetadataByConnectionId(
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

  async getUnhandledConnections(): Promise<ConnectionRecord[]> {
    return this.agent.connections.findAllByQuery({
      $or: [
        {
          state: DidExchangeState.ResponseReceived,
          role: DidExchangeRole.Requester,
        },
        {
          state: DidExchangeState.RequestReceived,
          role: DidExchangeRole.Responder,
        },
      ],
    });
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

  private async getConnectionDetails(
    connection: ConnectionRecord,
    outOfBandRecord?: OutOfBandRecord
  ): Promise<ConnectionDetails> {
    return {
      label: connection?.theirLabel ?? "",
      logo:
        connection?.imageUrl ?? outOfBandRecord?.outOfBandInvitation?.imageUrl,
      id: connection.id,
      status:
        connection.state === DidExchangeState.Completed
          ? ConnectionStatus.CONFIRMED
          : ConnectionStatus.PENDING,
      connectionDate: connection.createdAt.toISOString(),
      goalCode: outOfBandRecord?.outOfBandInvitation.goalCode,
      handshakeProtocols:
        outOfBandRecord?.outOfBandInvitation.handshakeProtocols,
      requestAttachments: outOfBandRecord?.outOfBandInvitation
        .getRequests()
        ?.map((request) => request["@id"]),
      serviceEndpoints: outOfBandRecord?.outOfBandInvitation
        .getServices()
        ?.filter((service) => typeof service !== "string")
        .map(
          (service) => (service as OutOfBandDidCommService)?.serviceEndpoint
        ),
      notes: await this.getConnectNotesByConnectionId(connection.id),
    };
  }

  private async getKeriConnectionDetails(
    id: string
  ): Promise<ConnectionDetails> {
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

  private async fetchShortUrl(invitationUrl: string) {
    const abortController = new AbortController();
    const id = setTimeout(() => abortController.abort(), 15000);
    let response;
    try {
      response = await fetch(invitationUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      throw new AriesFrameworkError(
        `Get request failed on provided url ${invitationUrl}`
      );
    }
    clearTimeout(id);
    return response;
  }
}

export { ConnectionService };
