import {
  Agent,
  ConnectionRecord,
  DidExchangeRole,
  DidExchangeState,
  OutOfBandInvitation,
  OutOfBandRecord,
  OutOfBandRole,
  OutOfBandState,
} from "@aries-framework/core";
import { ConnectionStatus } from "../agent.types";
import { ConnectionService } from "./connectionService";

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
  },
  receiveMessage: jest.fn(),
});
const connectionService = new ConnectionService(agent as any as Agent);

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

  test("can receive a valid message via oobi attachment", async () => {
    await connectionService.receiveAttachmentFromUrlConnectionless(
      "http://localhost:4320?d_m=InRlc3QgbWVzc2FnZSI="
    );
    expect(agent.receiveMessage).toBeCalledWith("test message");
  });

  test("receiving attachment should error if url invalid", async () => {
    await expect(
      connectionService.receiveAttachmentFromUrlConnectionless(
        "http://localhost:4320?c_i=InRlc3QgbWVzc2FnZSI="
      )
    ).rejects.toThrowError(ConnectionService.INVALID_CONNECTIONLESS_MSG);
    expect(agent.receiveMessage).not.toBeCalled();
  });

  test("can get all connections", async () => {
    agent.connections.getAll = jest
      .fn()
      .mockResolvedValue([
        incomingConnectionRecordNoAutoAccept,
        completedConnectionRecord,
      ]);
    expect(await connectionService.getConnections()).toStrictEqual([
      {
        id: id1,
        connectionDate: nowISO,
        label,
        logo: logoUrl,
        status: ConnectionStatus.PENDING,
      },
      {
        id: id2,
        connectionDate: nowISO,
        label,
        logo: logoUrl,
        status: ConnectionStatus.CONFIRMED,
      },
    ]);
    expect(agent.connections.getAll).toBeCalled();
  });

  test("can get all connections if there are none", async () => {
    agent.connections.getAll = jest.fn().mockResolvedValue([]);
    expect(await connectionService.getConnections()).toStrictEqual([]);
    expect(agent.connections.getAll).toBeCalled();
  });

  // @TODO - foconnor: Add some tests for diff combos of handshake protocols + request attachments
  test("can get connection (detailed view) by id that had oobi", async () => {
    agent.connections.getById = jest
      .fn()
      .mockResolvedValue(completedConnectionRecord);
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
    });
    expect(agent.connections.getById).toBeCalledWith(
      incomingConnectionRecordNoAutoAccept.id
    );
    expect(agent.oob.getById).not.toBeCalled();
  });
});
