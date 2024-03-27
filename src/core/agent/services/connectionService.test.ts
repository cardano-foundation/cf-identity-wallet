import {
  Agent,
  ConnectionEventTypes,
  ConnectionRecord,
  ConnectionStateChangedEvent,
  DidExchangeRole,
  DidExchangeState,
  OutOfBandInvitation,
  OutOfBandRecord,
  OutOfBandRole,
  OutOfBandState,
} from "@aries-framework/core";
import { EventEmitter } from "events";
import {
  ConnectionHistoryType,
  ConnectionType,
  ConnectionStatus,
} from "../agent.types";
import { ConnectionService } from "./connectionService";
import { SignifyApi } from "../modules/signify/signifyApi";
import { RecordType } from "../../storage/storage.types";

const eventEmitter = new EventEmitter();

const agent = jest.mocked({
  oob: {
    receiveInvitationFromUrl: jest.fn(),
    createInvitation: jest.fn(),
    getById: jest.fn(),
  },
  connections: {
    acceptRequest: jest.fn(),
    acceptResponse: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    findAllByQuery: jest.fn(),
    deleteById: jest.fn(),
  },
  modules: {
    generalStorage: {
      getCredentialMetadataByConnectionId: jest.fn(),
    },
  },
  receiveMessage: jest.fn(),
  events: {
    on: eventEmitter.on.bind(eventEmitter),
    emit: jest.fn(),
  },
  eventEmitter: {
    emit: eventEmitter.emit.bind(eventEmitter),
  },
  genericRecords: {
    save: jest.fn(),
    deleteById: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    findAllByQuery: jest.fn(),
  },
});

const basicStorage = jest.mocked({
  open: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const signifyApi = jest.mocked({
  resolveOobi: jest.fn(),
  getContacts: jest.fn(),
  getOobi: jest.fn(),
  deleteContactById: jest.fn(),
});

const connectionService = new ConnectionService(
  agent as any as Agent,
  basicStorage,
  signifyApi as any as SignifyApi
);

const oobi = new OutOfBandInvitation({
  label: "label",
  services: ["http://localhost:5341"],
});
const oobRecord = new OutOfBandRecord({
  outOfBandInvitation: oobi,
  role: OutOfBandRole.Sender,
  state: OutOfBandState.PrepareResponse,
});
const oobUrlStart =
  "didcomm://invite?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOi";
const oobUrlEnd =
  "iLCJsYWJlbCI6ImxhYmVsIiwic2VydmljZXMiOlsiaHR0cDovL2xvY2FsaG9zdDo1MzQxIl19";

const now = new Date();
const nowISO = now.toISOString();
const id1 = "id1";
const id2 = "id2";
const label = "connectionLabel";
const logoUrl = "http://somelogo";
const oobiId = "outOfBandId";

const incomingConnectionRecordNoAutoAccept = new ConnectionRecord({
  id: id1,
  createdAt: now,
  state: DidExchangeState.RequestReceived,
  role: DidExchangeRole.Responder,
  autoAcceptConnection: false,
  theirLabel: label,
  imageUrl: logoUrl,
});
const incomingConnectionRecordAutoAccept = new ConnectionRecord({
  state: DidExchangeState.RequestReceived,
  role: DidExchangeRole.Responder,
  autoAcceptConnection: true,
});
const connectionAcceptedRecordAutoAccept = new ConnectionRecord({
  state: DidExchangeState.ResponseSent,
  role: DidExchangeRole.Responder,
  autoAcceptConnection: false,
});
const connectionAcceptedRecord = new ConnectionRecord({
  state: DidExchangeState.ResponseSent,
  role: DidExchangeRole.Responder,
  autoAcceptConnection: true,
});
const requestedConnectionRecord = new ConnectionRecord({
  state: DidExchangeState.RequestSent,
  role: DidExchangeRole.Requester,
});
const requestedConnectionAcceptedRecord = new ConnectionRecord({
  state: DidExchangeState.ResponseReceived,
  role: DidExchangeRole.Requester,
});
const requestedConnectionAcceptedRecordAutoAccept = new ConnectionRecord({
  state: DidExchangeState.ResponseReceived,
  role: DidExchangeRole.Requester,
  autoAcceptConnection: true,
});
const completedConnectionRecord = new ConnectionRecord({
  id: id2,
  createdAt: now,
  theirLabel: label,
  imageUrl: logoUrl,
  state: DidExchangeState.Completed,
  role: DidExchangeRole.Requester,
  outOfBandId: oobiId,
});
const keriContacts = [
  {
    alias: "keri",
    challenges: [],
    id: "EKwzermyJ6VhunFWpo7fscyCILxFG7zZIM9JwSSABbZ5",
    oobi: "http://oobi",
    wellKnowns: [],
  },
];
const oobiPrefix = "oobi.";

// Callbacks need to be tested at an integration/e2e test level
describe("Connection service of agent - ConnectionRecord helpers", () => {
  // There are a number of permutations for these but these are the main cases to cover in case connectionService regresses by accident.

  // Incoming connections
  test("connection record represents incoming connection", () => {
    expect(
      connectionService.isConnectionRequestReceived(
        incomingConnectionRecordNoAutoAccept
      )
    ).toBe(true);
  });

  test("incoming connection should be ignored if auto accept is true", () => {
    expect(
      connectionService.isConnectionRequestReceived(
        incomingConnectionRecordAutoAccept
      )
    ).toBe(false);
  });

  test("accepted connections are not incoming (ready to be accepted)", () => {
    expect(
      connectionService.isConnectionRequestReceived(
        connectionAcceptedRecordAutoAccept
      )
    ).toBe(false);
  });

  test("accepted connections are not incoming (ready to be accepted)", () => {
    expect(
      connectionService.isConnectionRequestReceived(
        connectionAcceptedRecordAutoAccept
      )
    ).toBe(false);
  });

  test("connection record represents accepted", () => {
    expect(
      connectionService.isConnectionResponseSent(connectionAcceptedRecord)
    ).toBe(true);
  });

  // Acceptance to incoming connections
  test("connection record represents accepted incoming connection", () => {
    expect(
      connectionService.isConnectionResponseSent(
        connectionAcceptedRecordAutoAccept
      )
    ).toBe(true);
  });

  test("incoming connections are not responses", () => {
    expect(
      connectionService.isConnectionResponseSent(
        incomingConnectionRecordAutoAccept
      )
    ).toBe(false);
  });

  test("requested connection response is not an incoming connection response", async () => {
    expect(
      connectionService.isConnectionResponseSent(
        requestedConnectionAcceptedRecord
      )
    ).toBe(false);
  });

  // Connection requests
  test("connection record represents a requested connection", () => {
    expect(
      connectionService.isConnectionRequestSent(requestedConnectionRecord)
    ).toBe(true);
  });

  test("incoming connection is not a requested connection", () => {
    expect(
      connectionService.isConnectionRequestSent(
        incomingConnectionRecordAutoAccept
      )
    ).toBe(false);
  });

  test("acceptance to initially requested connection is not the first request", () => {
    expect(
      connectionService.isConnectionRequestSent(
        requestedConnectionAcceptedRecord
      )
    ).toBe(false);
  });

  // Requested connection response
  test("connection record represents other party's acceptance of a requested connection", () => {
    expect(
      connectionService.isConnectionResponseReceived(
        requestedConnectionAcceptedRecord
      )
    ).toBe(true);
  });

  test("auto accept true records are ignored when checking for other party's acceptance of a requested connection", () => {
    expect(
      connectionService.isConnectionResponseReceived(
        requestedConnectionAcceptedRecordAutoAccept
      )
    ).toBe(false);
  });

  test("initial request is not other party's acceptance yet", () => {
    expect(
      connectionService.isConnectionResponseReceived(requestedConnectionRecord)
    ).toBe(false);
  });

  // Connected
  test("connection record represents completed connection", () => {
    expect(
      connectionService.isConnectionConnected(completedConnectionRecord)
    ).toBe(true);
  });

  test("non completed connection check", () => {
    expect(
      connectionService.isConnectionConnected(requestedConnectionRecord)
    ).toBe(false);
  });
});

describe("Connection service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("can receive an OOBI", async () => {
    const oobi = "http://localhost?oob=3423";
    await connectionService.receiveInvitationFromUrl(oobi);
    // We aren't too concerned with testing the config passed
    expect(agent.oob.receiveInvitationFromUrl).toBeCalledWith(
      oobi,
      expect.any(Object)
    );
  });

  test("can accept a request by connection id", async () => {
    const connectionId = "connectionId";
    await connectionService.acceptRequestConnection(connectionId);
    expect(agent.connections.acceptRequest).toBeCalledWith(connectionId);
  });

  test("can accept a response by connection id", async () => {
    const connectionId = "connectionId";
    await connectionService.acceptResponseConnection(connectionId);
    expect(agent.connections.acceptResponse).toBeCalledWith(connectionId);
  });

  test("can create an invitation via the mediator", async () => {
    agent.oob.createInvitation = jest.fn().mockResolvedValue(oobRecord);
    const invitation = await connectionService.createMediatorInvitation();
    expect(invitation.invitation).toBe(oobi);
    expect(invitation.record).toBe(oobRecord);
    expect(invitation.invitationUrl.startsWith(oobUrlStart)).toBe(true);
    expect(invitation.invitationUrl.endsWith(oobUrlEnd)).toBe(true);
  });

  test("errors appropriately if we invitation is wrong", async () => {
    await expect(
      connectionService.createMediatorInvitation()
    ).rejects.toThrowError(ConnectionService.COULD_NOT_CREATE_OOB_VIA_MEDIATOR);
  });

  test("can get all connections", async () => {
    basicStorage.getAll = jest.fn().mockResolvedValue([
      {
        id: keriContacts[0].id,
        createdAt: now,
        type: RecordType.CONNECTION_KERI_METADATA,
        content: {
          alias: "keri",
        },
      },
    ]);
    agent.connections.getAll = jest
      .fn()
      .mockResolvedValue([
        incomingConnectionRecordNoAutoAccept,
        completedConnectionRecord,
      ]);
    signifyApi.getContacts = jest.fn().mockResolvedValue(keriContacts);
    expect(await connectionService.getConnections()).toEqual([
      {
        id: id1,
        connectionDate: nowISO,
        label,
        logo: logoUrl,
        status: ConnectionStatus.PENDING,
        type: ConnectionType.DIDCOMM,
      },
      {
        id: id2,
        connectionDate: nowISO,
        label,
        logo: logoUrl,
        status: ConnectionStatus.CONFIRMED,
        type: ConnectionType.DIDCOMM,
      },
      {
        id: keriContacts[0].id,
        label: keriContacts[0].alias,
        status: ConnectionStatus.CONFIRMED,
        type: ConnectionType.KERI,
        connectionDate: expect.any(String),
      },
    ]);
    expect(agent.connections.getAll).toBeCalled();
  });

  test("can get all connections if there are none", async () => {
    agent.connections.getAll = jest.fn().mockResolvedValue([]);
    basicStorage.getAll = jest.fn().mockResolvedValue([]);
    expect(await connectionService.getConnections()).toStrictEqual([]);
    expect(agent.connections.getAll).toBeCalled();
  });

  // @TODO - foconnor: Add some tests for diff combos of handshake protocols + request attachments
  test("can get connection (detailed view) by id that had oobi", async () => {
    agent.connections.getById = jest
      .fn()
      .mockResolvedValue(completedConnectionRecord);
    basicStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    agent.oob.getById = jest.fn().mockResolvedValue(oobRecord);
    expect(
      await connectionService.getConnectionById(completedConnectionRecord.id)
    ).toStrictEqual({
      id: id2,
      connectionDate: nowISO,
      label,
      logo: logoUrl,
      status: ConnectionStatus.CONFIRMED,
      goalCode: oobi.goalCode,
      handshakeProtocols: oobi.handshakeProtocols,
      requestAttachments: oobi.appendedAttachments,
      serviceEndpoints: [], // @TODO - foconnor: This shouldn't be empty
      notes: [],
    });
    expect(agent.connections.getById).toBeCalledWith(
      completedConnectionRecord.id
    );
    expect(agent.oob.getById).toBeCalledWith(
      completedConnectionRecord.outOfBandId
    );
  });

  test("can get connection (detailed view) by id that had no oobi", async () => {
    agent.connections.getById = jest
      .fn()
      .mockResolvedValue(incomingConnectionRecordNoAutoAccept);
    basicStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    agent.oob.getById = jest.fn().mockResolvedValue(oobRecord);
    expect(
      await connectionService.getConnectionById(
        incomingConnectionRecordNoAutoAccept.id
      )
    ).toStrictEqual({
      id: id1,
      connectionDate: nowISO,
      label,
      logo: logoUrl,
      status: ConnectionStatus.PENDING,
      goalCode: undefined,
      handshakeProtocols: undefined,
      requestAttachments: undefined,
      serviceEndpoints: undefined,
      notes: [],
    });
    expect(agent.connections.getById).toBeCalledWith(
      incomingConnectionRecordNoAutoAccept.id
    );
    expect(agent.oob.getById).not.toBeCalled();
  });

  test("must call fetch url first when invitation url contains /shorten", async () => {
    const shortUrl = "http://localhost:3000/shorten/abc123";
    const fullUrl = "http://localhost?oob=3423";
    // eslint-disable-next-line no-undef
    global.fetch = jest.fn().mockResolvedValue({
      text: async function () {
        return fullUrl;
      },
    });
    await connectionService.receiveInvitationFromUrl(shortUrl);
    expect(agent.oob.receiveInvitationFromUrl).toBeCalledWith(
      fullUrl,
      expect.any(Object)
    );
  });

  test("get shorten url success", async () => {
    const shortUrlMock = "http://localhost:3000/shorten/abc123";
    const fullUrl =
      "http://localhost?oob=12312312312312312312312312312312312312312312";
    // eslint-disable-next-line no-undef
    global.fetch = jest.fn().mockResolvedValue({
      text: async function () {
        return `{"data": "${shortUrlMock}"}`;
      },
    });
    const shortUrl = await connectionService.getShortenUrl(fullUrl);
    expect(shortUrl).toEqual(shortUrlMock);
  });

  test("can get connection (short detail view) by id", async () => {
    agent.connections.getById = jest
      .fn()
      .mockResolvedValue(completedConnectionRecord);
    expect(
      await connectionService.getConnectionShortDetailById(
        completedConnectionRecord.id
      )
    ).toEqual({
      id: id2,
      connectionDate: nowISO,
      label,
      logo: logoUrl,
      status: ConnectionStatus.CONFIRMED,
      type: ConnectionType.DIDCOMM,
    });
    expect(agent.connections.getById).toBeCalledWith(
      completedConnectionRecord.id
    );
  });

  test("can receive offer credential with connectionless", async () => {
    const url = "http://localhost:4320?d_m=InRlc3QgbWVzc2FnZSI=";
    await connectionService.receiveInvitationFromUrl(url);
    expect(agent.oob.receiveInvitationFromUrl).toBeCalledWith(
      url,
      expect.any(Object)
    );
  });

  test("callback will run when have a event listener", async () => {
    const callback = jest.fn();
    connectionService.onConnectionStateChanged(callback);
    const event: ConnectionStateChangedEvent = {
      type: ConnectionEventTypes.ConnectionStateChanged,
      payload: {
        connectionRecord: completedConnectionRecord,
        previousState: DidExchangeState.ResponseReceived,
      },
      metadata: {
        contextCorrelationId: id1,
      },
    };
    agent.eventEmitter.emit(ConnectionEventTypes.ConnectionStateChanged, event);
    expect(callback).toBeCalledWith(event);
  });

  test("can save connection note with generic records", async () => {
    const connectionId = "connectionId";
    const note = {
      title: "title",
      message: "message",
    };
    await connectionService.createConnectionNote(connectionId, note);
    expect(basicStorage.save).toBeCalledWith({
      id: expect.any(String),
      content: note,
      type: RecordType.CONNECTION_NOTE,
      tags: { connectionId },
    });
  });

  test("can delete connection note with id", async () => {
    const connectionNoteId = "connectionId";
    await connectionService.deleteConnectionNoteById(connectionNoteId);
    expect(basicStorage.deleteById).toBeCalledWith(connectionNoteId);
  });

  test("cannot update connection note because connection note invalid", async () => {
    const connectionId = "connectionId";
    const note = {
      title: "title",
      message: "message",
    };
    await expect(
      connectionService.updateConnectionNoteById(connectionId, note)
    ).rejects.toThrowError(ConnectionService.CONNECTION_NOTE_RECORD_NOT_FOUND);
  });

  test("can update connection note by id", async () => {
    const mockGenericRecords = {
      id: "id",
      content: {
        title: "title",
        message: "message",
      },
    };
    basicStorage.findById = jest.fn().mockResolvedValue(mockGenericRecords);
    const connectionId = "connectionId";
    const note = {
      title: "title",
      message: "message2",
    };
    await connectionService.updateConnectionNoteById(connectionId, note);
    expect(basicStorage.update).toBeCalledWith({
      ...mockGenericRecords,
      content: note,
    });
  });

  test("must call filler credential by query when get connection history", async () => {
    const connectionIdTest = "testId";
    agent.modules.generalStorage.getCredentialMetadataByConnectionId = jest
      .fn()
      .mockResolvedValue([
        {
          credentialId: 1,
          createdAt: now,
          credentialType: "ACDC",
        },
      ]);
    expect(
      await connectionService.getConnectionHistoryById(connectionIdTest)
    ).toEqual([
      {
        type: ConnectionHistoryType.CREDENTIAL_ACCEPTED,
        timestamp: nowISO,
        credentialType: "ACDC",
      },
    ]);
    expect(
      agent.modules.generalStorage.getCredentialMetadataByConnectionId
    ).toBeCalledWith(connectionIdTest);
  });

  test("can get unhandled connections to re-processing", async () => {
    agent.connections.findAllByQuery = jest
      .fn()
      .mockResolvedValue([connectionAcceptedRecordAutoAccept]);
    expect(await connectionService.getUnhandledConnections()).toEqual([
      connectionAcceptedRecordAutoAccept,
    ]);
    expect(agent.connections.findAllByQuery).toBeCalledWith({
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
  });

  test("can delete conenction by id", async () => {
    basicStorage.findAllByQuery = jest.fn().mockReturnValue([]);
    const connectionId = "connectionId";
    await connectionService.deleteConnectionById(
      connectionId,
      ConnectionType.KERI
    );
    expect(basicStorage.deleteById).toBeCalledWith(connectionId);
    // expect(signifyApi.deleteContactById).toBeCalledWith(connectionId);  // @TODO - foconnor: Re-enable once KERIA fixed.
    await connectionService.deleteConnectionById(
      connectionId,
      ConnectionType.DIDCOMM
    );
    expect(agent.connections.deleteById).toBeCalledWith(connectionId);
  });

  test("Should delete connection's notes when deleting that connection", async () => {
    basicStorage.findAllByQuery = jest.fn().mockReturnValue([
      {
        id: "uuid",
        content: {
          title: "title",
        },
      },
    ]);
    const connectionId = "connectionId";
    await connectionService.deleteConnectionById(
      connectionId,
      ConnectionType.KERI
    );
    await connectionService.deleteConnectionById(
      connectionId,
      ConnectionType.DIDCOMM
    );
    expect(basicStorage.deleteById).toBeCalledTimes(3);
  });

  test("can receive keri oobi", async () => {
    signifyApi.resolveOobi.mockImplementation((url) => {
      return { name: url, response: { i: "id" } };
    });
    const oobi =
      "http://127.0.0.1:3902/oobi/EBRcDDwjOfqZwC1w2XFcE1mKQUb1LekNNidkZ8mrIEaw/agent/EEXekkGu9IAzav6pZVJhkLnjtjM5v3AcyA-pdKUcaGei";
    await connectionService.receiveInvitationFromUrl(oobi);
    // We aren't too concerned with testing the config passed
    expect(signifyApi.resolveOobi).toBeCalledWith(oobi);
  });

  test("can get connection keri (short detail view) by id", async () => {
    basicStorage.findById = jest.fn().mockResolvedValue({
      id: keriContacts[0].id,
      createdAt: now,
      content: {
        alias: "keri",
      },
    });
    expect(
      await connectionService.getConnectionKeriShortDetailById(
        keriContacts[0].id
      )
    ).toMatchObject({
      id: keriContacts[0].id,
      connectionDate: nowISO,
      label: "keri",
      status: ConnectionStatus.CONFIRMED,
      type: ConnectionType.KERI,
    });
    expect(basicStorage.findById).toBeCalledWith(keriContacts[0].id);
  });

  test("can get KERI OOBI", async () => {
    signifyApi.getOobi = jest.fn().mockImplementation((name: string) => {
      return `${oobiPrefix}${name}`;
    });
    const signifyName = "keriuuid";
    const KeriOobi = await connectionService.getKeriOobi(signifyName);
    expect(KeriOobi).toEqual(oobiPrefix + signifyName);
  });

  test("can get a KERI OOBI with an alias (URL encoded)", async () => {
    signifyApi.getOobi = jest.fn().mockImplementation((name: string) => {
      return `${oobiPrefix}${name}`;
    });
    const signifyName = "keriuuid";
    const KeriOobi = await connectionService.getKeriOobi(
      signifyName,
      "alias with spaces"
    );
    expect(KeriOobi).toEqual(
      `${oobiPrefix}${signifyName}?name=alias%20with%20spaces`
    );
  });

  test("Should call createIdentifierMetadataRecord when there are un-synced KERI contacts", async () => {
    signifyApi.getContacts = jest.fn().mockReturnValue([
      {
        id: "EBaDnyriYK_FAruigHO42avVN40fOlVSUxpxXJ1fNxFR",
        alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
        oobi: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/oobi/EBaDnyriYK_FAruigHO42avVN40fOlVSUxpxXJ1fNxFR/agent/EP48HXCPvtzGu0c90gG9fkOYiSoi6U5Am-XaqcoNHTBl",
        challenges: [],
        wellKnowns: [],
      },
      {
        id: "ECTcHGs3EhJEdVTW10vm5pkiDlOXlR8bPBj9-8LSpZ3W",
        alias: "e6d37a7b-00e9-4f85-8cf9-2123d15fc094",
        oobi: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/oobi/ECTcHGs3EhJEdVTW10vm5pkiDlOXlR8bPBj9-8LSpZ3W/agent/EJMV0RgikXM7jyvXB9oOyKSZzo_AsYrEgP15Ly0dwzEL",
        challenges: [],
        wellKnowns: [],
      },
    ]);
    basicStorage.getAll = jest.fn().mockReturnValue([]);
    await connectionService.syncKeriaContacts();
    expect(basicStorage.save).toBeCalledTimes(2);
  });
});
