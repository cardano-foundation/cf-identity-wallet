import {
  AriesFrameworkError,
  ConnectionEventTypes,
  ConnectionRecord,
  ConnectionStateChangedEvent,
  ConnectionType,
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
  ConnectionNoteDetails,
  ConnectionNoteProps,
  ConnectionShortDetails,
  ConnectionStatus,
  GenericRecordType,
} from "../agent.types";
// import { LibP2p } from "../transports/libp2p/libP2p";
// import { LibP2pOutboundTransport } from "../transports/libP2pOutboundTransport";
import { AgentService } from "./agentService";

const SERVER_GET_SHORTEN_URL =
  // eslint-disable-next-line no-undef
  process.env.REACT_APP_SERVER_GET_SHORTEN_URL ?? "http://localhost:3001";

class ConnectionService extends AgentService {
  // static readonly NOT_FOUND_DOMAIN_CONFIG_ERROR_MSG =
  //   "No domain found in config";
  static readonly COULD_NOT_CREATE_OOB_VIA_MEDIATOR =
    "Could not create new mediator oob invitation";
  static readonly INVALID_CONNECTIONLESS_MSG =
    "Invalid connectionless OOBI - does not contain d_m parameter";
  static readonly CONNECTION_NOTE_RECORD_NOT_FOUND =
    "Connection note record not found";

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
    if (url.includes("/shorten")) {
      const response = await this.fetchShortUrl(url);
      url = await response.text();
    }
    await this.agent.oob.receiveInvitationFromUrl(url, {
      autoAcceptConnection: true,
      autoAcceptInvitation: true,
      reuseConnection: true,
    });
  }

  // @TODO: this is a temporary feature, an api should be added in the mediator to get the shorten url
  async getShortenUrl(invitationUrl: string): Promise<string> {
    const getUrl = await fetch(
      `${SERVER_GET_SHORTEN_URL}/shorten?url=${invitationUrl}`
    );
    const response = await getUrl.text();
    return JsonEncoder.fromString(response).data;
  }

  async receiveAttachmentFromUrlConnectionless(url: string): Promise<void> {
    const split = url.split("?d_m=");
    if (split.length !== 2) {
      throw new Error(ConnectionService.INVALID_CONNECTIONLESS_MSG);
    }
    await this.agent.receiveMessage(JsonEncoder.fromBase64(split[1]));
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
    return connection.connectionTypes.includes(ConnectionType.Mediator);
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
    };
  }

  async getConnectionById(id: string): Promise<ConnectionDetails> {
    const connection = await this.agent.connections.getById(id);
    let outOfBandRecord: OutOfBandRecord | undefined;
    if (connection.outOfBandId) {
      outOfBandRecord = await this.agent.oob.getById(connection.outOfBandId);
    }
    return this.getConnectionDetails(connection, outOfBandRecord);
  }

  async getConnectionShortDetailById(
    id: string
  ): Promise<ConnectionShortDetails> {
    const connection = await this.agent.connections.getById(id);
    return this.getConnectionShortDetails(connection);
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
