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
import { GenericRecord } from "@aries-framework/core/build/modules/generic-records/repository/GenericRecord";
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
  GenericRecordType,
} from "../agent.types";
// import { LibP2p } from "../transports/libp2p/libP2p";
// import { LibP2pOutboundTransport } from "../transports/libP2pOutboundTransport";
import { AgentService } from "./agentService";
import { KeriContact } from "../modules/signify/signifyApi.types";
import { AriesAgent } from "../agent";
import { IdentifierType } from "./identifierService.types";

const SERVER_GET_SHORTEN_URL =
  // eslint-disable-next-line no-undef
  process.env.REACT_APP_SERVER_GET_SHORTEN_URL ??
  "https://dev.credentials.cf-keripy.metadata.dev.cf-deployments.org";

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
      const operation = await this.agent.modules.signify.resolveOobi(url);
      const connectionId = operation.response.i;
      await this.createConnectionKeriMetadata(connectionId, {
        alias: operation.alias,
        oobi: url,
      });

      // @TODO - foconnor: This is temporary for ease of development, will be removed soon.
      // For now this will make KERI contacts operate similarily to DIDComm comms if it's from our deployed cred server.
      // Will only be confirmed in our wallet once the other agent also resolves our OOBI - it will also issue an ACDC at the same time.
      if (url.includes("dev.keria.cf-keripy.metadata.dev.cf-deployments.org")) {
        // This is inefficient but it will change going forward.
        const aid = (await AriesAgent.agent.identifiers.getIdentifiers()).find(
          (identifier) => identifier.method === IdentifierType.KERI
        );
        if (aid && aid.signifyName) {
          // signifyName should always be set
          const oobi = await AriesAgent.agent.connections.getKeriOobi(
            aid.signifyName
          );
          await (
            await fetch(
              "https://dev.credentials.cf-keripy.metadata.dev.cf-deployments.org/issueAcdcCredentialWithOobi",
              {
                method: "POST",
                body: JSON.stringify({ oobi }),
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
          ).json();
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
    const getUrl = await fetch(`${SERVER_GET_SHORTEN_URL}/shorten`, {
      method: "POST",
      body: JSON.stringify({ url: invitationUrl }),
      headers: {
        "Content-Type": "application/json",
      },
    });
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
    record: GenericRecord
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
      await this.agent.genericRecords.deleteById(id);
      await this.agent.modules.signify.deleteContactById(id);
    } else {
      await this.agent.connections.deleteById(id);
    }
    const notes = await this.getConnectNotesByConnectionId(id);
    for (const note of notes) {
      this.agent.genericRecords.deleteById(note.id);
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
    await this.agent.genericRecords.save({
      id: utils.uuid(),
      content: note,
      tags: {
        connectionId,
        type: GenericRecordType.CONNECTION_NOTE,
      },
    });
  }

  async updateConnectionNoteById(
    connectionNoteId: string,
    note: ConnectionNoteProps
  ) {
    const noteRecord = await this.agent.genericRecords.findById(
      connectionNoteId
    );
    if (!noteRecord) {
      throw new Error(ConnectionService.CONNECTION_NOTE_RECORD_NOT_FOUND);
    }
    noteRecord.content = note;
    await this.agent.genericRecords.update(noteRecord);
  }

  async deleteConnectionNoteById(connectionNoteId: string) {
    return this.agent.genericRecords.deleteById(connectionNoteId);
  }

  async getKeriOobi(signifyName: string): Promise<string> {
    return this.agent.modules.signify.getOobi(signifyName);
  }

  private async createConnectionKeriMetadata(
    connectionId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.agent.genericRecords.save({
      id: connectionId,
      content: metadata || {},
      tags: {
        type: GenericRecordType.CONNECTION_KERI_METADATA,
      },
    });
  }

  private async getConnectionKeriMetadataById(
    connectionId: string
  ): Promise<GenericRecord> {
    const connectionKeri = await this.agent.genericRecords.findById(
      connectionId
    );
    if (!connectionKeri) {
      throw new Error(
        ConnectionService.CONNECTION_KERI_METADATA_RECORD_NOT_FOUND
      );
    }
    return connectionKeri;
  }

  async getAllConnectionKeriMetadata(): Promise<GenericRecord[]> {
    const connectionKeris = await this.agent.genericRecords.findAllByQuery({
      type: GenericRecordType.CONNECTION_KERI_METADATA,
    });
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
    const signifyContacts = await this.agent.modules.signify.getContacts();
    const storageContacts = await this.getAllConnectionKeriMetadata();
    const unSyncedData = signifyContacts.filter(
      (contact: KeriContact) =>
        !storageContacts.find((item) => contact.id === item.id)
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
    const notes = await this.agent.genericRecords.findAllByQuery({
      connectionId,
      type: GenericRecordType.CONNECTION_NOTE,
    });
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
    const connection = await this.agent.modules.signify.getContactById(id);
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

  // @TODO - foconnor: fix and add tests;
  // These libs are ESM exported and not working in Jest right now - can fix later.

  // async enableP2P() {
  //   const inBoundTransport = LibP2p.libP2p.inBoundTransport;
  //   await inBoundTransport.start(this.agent);
  //   this.agent.registerInboundTransport(inBoundTransport);

  //   const outBoundTransport = new LibP2pOutboundTransport(LibP2p.libP2p);
  //   await outBoundTransport.start(this.agent);
  //   this.agent.registerOutboundTransport(outBoundTransport);
  // }

  // async createNewWebRtcInvitation() {
  //   const domains = this.agent.config.endpoints;
  //   const libP2pDomain = domains.find((domain) => domain.includes("libp2p"));
  //   if (!libP2pDomain) {
  //     throw new Error(ConnectionService.NOT_FOUND_DOMAIN_CONFIG_ERROR_MSG);
  //   }

  //   const createInvitation = await this.agent.oob.createInvitation({
  //     autoAcceptConnection: false,
  //   });

  //   return createInvitation.outOfBandInvitation.toUrl({
  //     domain: libP2pDomain,
  //   });
  // }
}

export { ConnectionService };
