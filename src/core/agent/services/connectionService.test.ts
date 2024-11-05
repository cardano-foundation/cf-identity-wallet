import { Salter } from "signify-ts";
import { ConnectionStatus, KeriConnectionType } from "../agent.types";
import { ConnectionService } from "./connectionService";
import { CoreEventEmitter } from "../event";
import { ConfigurationService } from "../../configuration";
import { Agent } from "../agent";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { EventTypes } from "../event.types";
import {
  ConnectionHistoryType,
  KeriaContactKeyPrefix,
} from "./connectionService.types";
import { ConnectionRecord, ConnectionRecordStorageProps } from "../records";

const contactListMock = jest.fn();
let deleteContactMock = jest.fn();
const updateContactMock = jest.fn();
const getOobiMock = jest.fn();
const getIdentifier = jest.fn();
const saveOperationPendingMock = jest.fn();
let contactGetMock = jest.fn();

const failUuid = "fail-uuid";
const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: jest.fn(),
    get: getIdentifier,
    create: jest.fn(),
    addEndRole: jest.fn(),
    interact: jest.fn(),
    rotate: jest.fn(),
    members: jest.fn(),
  }),
  operations: () => ({
    get: jest.fn().mockImplementation((id: string) => {
      if (id === `${oobiPrefix}${failUuid}`) {
        return {
          done: false,
          name: id,
        };
      }
      return {
        done: true,
        response: {
          i: id,
        },
        name: id,
      };
    }),
  }),
  oobis: () => ({
    get: getOobiMock,
    resolve: jest.fn().mockImplementation((name: string) => {
      if (name === `${oobiPrefix}${failUuid}`) {
        return {
          done: false,
          name,
          metadata: {
            oobi: `${oobiPrefix}${failUuid}`,
          },
        };
      }
      return {
        done: true,
        response: {
          i: name,
          dt: now,
        },
        metadata: {
          oobi: `${oobiPrefix}${failUuid}`,
        },
        name,
      };
    }),
  }),
  contacts: () => ({
    list: contactListMock,
    get: contactGetMock,
    delete: deleteContactMock,
    update: updateContactMock,
  }),
  notifications: () => ({
    list: jest.fn(),
    mark: jest.fn(),
  }),
  ipex: () => ({
    admit: jest.fn(),
    submitAdmit: jest.fn(),
  }),
  credentials: () => ({
    list: jest.fn(),
  }),
  exchanges: () => ({
    get: jest.fn(),
    send: jest.fn(),
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: jest.fn(),
    get: jest.fn(),
  }),
});

const eventEmitter = new CoreEventEmitter();

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventEmitter,
};

const connectionStorage = jest.mocked({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const connectionNoteStorage = jest.mocked({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const operationPendingStorage = jest.mocked({
  save: saveOperationPendingMock,
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const getIpexMessageMetadataByConnectionIdMock = jest.fn();

const credentialStorage = jest.mocked({
  getAllCredentialMetadata: jest.fn(),
  deleteCredentialMetadata: jest.fn(),
  getCredentialMetadata: jest.fn(),
  saveCredentialMetadataRecord: jest.fn(),
  updateCredentialMetadata: jest.fn(),
  getCredentialMetadatasById: jest.fn(),
});

const identifiers = jest.mocked({
  getIdentifierMetadataByGroupId: jest.fn(),
});

const connectionService = new ConnectionService(
  agentServicesProps,
  connectionStorage as any,
  credentialStorage as any,
  operationPendingStorage as any,
  identifiers as any
);

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      getKeriaOnlineStatus: jest.fn(),
      identifiers: { getKeriIdentifierByGroupId: jest.fn() },
    },
  },
}));

jest.mock("uuid", () => {
  return {
    v4: () => "uuid",
  };
});

jest.mock("signify-ts", () => ({
  Salter: jest.fn().mockImplementation(() => {
    return { qb64: "" };
  }),
}));

const now = new Date();
const nowISO = now.toISOString();
const keriContacts = [
  {
    alias: "keri",
    challenges: [],
    id: "EKwzermyJ6VhunFWpo7fscyCILxFG7zZIM9JwSSABbZ5",
    oobi: "http://oobi",
    wellKnowns: [],
  },
];

const connectionRecordProps: ConnectionRecordStorageProps = {
  id: "EKwzermyJ6VhunFWpo7fscyCILxFG7zZIM9JwSSABbZ5",
  createdAt: now,
  alias: "keri",
  oobi: "http://oobi",
  tags: {},
  pending: false,
};

const connectionRecord = new ConnectionRecord(connectionRecordProps);

const oobiPrefix = "http://oobi.com/oobi/";

describe("Connection service of agent", () => {
  beforeAll(async () => {
    await new ConfigurationService().start();
  });
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should return connection type to trigger UI to create a new identifier", async () => {
    const fixedDate = "2024-01-01T00:00:00.000Z";
    const fixedTimestamp = 1704067200000;
    jest.spyOn(Date, "now").mockReturnValue(fixedTimestamp);
    jest.spyOn(global.Date.prototype, "toISOString").mockReturnValue(fixedDate);

    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const groupId = "123";
    const oobi = `http://localhost/oobi/id?groupId=${groupId}&name=alias`;
    signifyClient.oobis().resolve = jest.fn().mockImplementation((url) => {
      return { name: url, response: { i: "id" } };
    });

    const result = await connectionService.connectByOobiUrl(oobi);
    expect(result).toStrictEqual({
      type: KeriConnectionType.MULTI_SIG_INITIATOR,
      groupId,
      connection: {
        groupId,
        id: "id",
        label: "alias",
        oobi,
        status: ConnectionStatus.CONFIRMED,
        connectionDate: fixedDate,
      },
    });
    expect(connectionStorage.save).toBeCalled();
    jest.restoreAllMocks();
  });

  test("Can create groupId connections for existing pending multi-sigs", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const groupId = "123";
    const oobi = `http://localhost/oobi=3423?groupId=${groupId}`;
    signifyClient.oobis().resolve = jest.fn().mockImplementation((url) => {
      return { alias: "alias", name: url, response: { i: "id" } };
    });

    await connectionService.connectByOobiUrl(oobi);
    expect(connectionStorage.save).toBeCalled();
  });

  test("can get all connections and multi-sig related ones are filtered", async () => {
    connectionStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        id: keriContacts[0].id,
        createdAt: now,
        alias: "keri",
        oobi: "oobi",
        getTag: jest.fn(),
        pending: false,
      },
      {
        id: keriContacts[0].id,
        createdAt: now,
        alias: "keri",
        oobi: "oobi",
        getTag: jest.fn(),
        pending: true,
      },
    ]);
    expect(await connectionService.getConnections()).toEqual([
      {
        id: keriContacts[0].id,
        label: "keri",
        oobi: "oobi",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: expect.any(String),
      },
      {
        id: keriContacts[0].id,
        label: "keri",
        oobi: "oobi",
        status: ConnectionStatus.PENDING,
        connectionDate: expect.any(String),
      },
    ]);
  });

  test("can get all multisig connections", async () => {
    const groupId = "group-id";
    const metadata = {
      id: "id",
      alias: "alias",
      oobi: `localhost/oobi=2442?groupId=${groupId}`,
      groupId,
      createdAt: new Date(),
      getTag: jest.fn().mockReturnValue(groupId),
    };
    connectionStorage.findAllByQuery = jest.fn().mockResolvedValue([metadata]);
    expect(await connectionService.getMultisigConnections()).toEqual([
      {
        id: metadata.id,
        label: metadata.alias,
        connectionDate: metadata.createdAt.toISOString(),
        status: ConnectionStatus.CONFIRMED,
        oobi: metadata.oobi,
        groupId: metadata.groupId,
      },
    ]);
  });

  test("can save connection note with generic records", async () => {
    const connectionId = "connectionId";
    const note = {
      title: "title",
      message: "message",
    };
    const id = new Salter({}).qb64;
    const now = new Date();
    await connectionService.createConnectionNote(connectionId, note);
    expect(updateContactMock).toBeCalledWith(connectionId, {
      [`note:${id}`]: JSON.stringify({
        ...note,
        id: `note:${id}`,
        timestamp: now.toISOString(),
      }),
    });
  });

  test("can delete connection note with id", async () => {
    const connectionNoteId = "connectionNoteId";
    const connectionId = "connectionId";
    await connectionService.deleteConnectionNoteById(
      connectionId,
      connectionNoteId
    );
    expect(updateContactMock).toBeCalledWith(connectionId, {
      [connectionNoteId]: null,
    });
  });

  test("can update connection note by id", async () => {
    const connectionToUpdate = {
      id: "note:id",
      title: "title",
      message: "message",
    };
    const connectionId = "connectionId";

    await connectionService.updateConnectionNoteById(
      connectionId,
      connectionToUpdate.id,
      connectionToUpdate
    );
    expect(updateContactMock).toBeCalledWith(connectionId, {
      "note:id": JSON.stringify(connectionToUpdate),
    });
  });

  test("can receive keri oobi", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    signifyClient.oobis().resolve.mockResolvedValue({
      done: true,
    });
    const oobi =
      "http://127.0.0.1:3902/oobi/EBRcDDwjOfqZwC1w2XFcE1mKQUb1LekNNidkZ8mrIEaw/agent/EEXekkGu9IAzav6pZVJhkLnjtjM5v3AcyA-pdKUcaGei";
    await connectionService.connectByOobiUrl(oobi);
  });

  test("can get a KERI OOBI with an alias (URL encoded)", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    getOobiMock.mockImplementation((name: string) => {
      return {
        oobis: [`${oobiPrefix}${name}`],
        done: true,
      };
    });
    signifyClient.oobis().get = jest.fn().mockImplementation((name: string) => {
      return `${oobiPrefix}${name}`;
    });
    const id = "keriuuid";
    const KeriOobi = await connectionService.getOobi(id, "alias with spaces");
    expect(KeriOobi).toEqual(`${oobiPrefix}${id}?name=alias+with+spaces`);
  });

  test("can get KERI OOBI with alias and groupId", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    getOobiMock.mockImplementation((name: string) => {
      return {
        oobis: [`${oobiPrefix}${name}`],
        done: true,
      };
    });
    const id = "id";
    const KeriOobi = await connectionService.getOobi(id, "alias", "123");
    expect(KeriOobi).toEqual(`${oobiPrefix}${id}?name=alias&groupId=123`);
  });

  test("can get connection keri (short detail view) by id", async () => {
    connectionStorage.findById = jest.fn().mockResolvedValue({
      id: keriContacts[0].id,
      createdAt: now,
      alias: "keri",
      getTag: jest.fn(),
    });
    expect(
      await connectionService.getConnectionShortDetailById(keriContacts[0].id)
    ).toMatchObject({
      id: keriContacts[0].id,
      connectionDate: nowISO,
      label: "keri",
      status: ConnectionStatus.CONFIRMED,
    });
    expect(connectionStorage.findById).toBeCalledWith(keriContacts[0].id);
  });

  test("can get KERI OOBI", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    getOobiMock.mockImplementation((name: string) => {
      return {
        oobis: [`${oobiPrefix}${name}`],
        done: true,
      };
    });
    const id = "id";
    const KeriOobi = await connectionService.getOobi(id);
    expect(KeriOobi).toEqual(oobiPrefix + id);
  });

  test("Should call createIdentifierMetadataRecord when there are un-synced KERI contacts", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    contactListMock.mockReturnValue([
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
    connectionStorage.getAll = jest.fn().mockReturnValue([]);
    await connectionService.syncKeriaContacts();
    expect(connectionStorage.save).toBeCalledTimes(2);
  });

  test("Can get multisig linked contacts", async () => {
    const groupId = "123";
    const metadata = {
      id: "id",
      alias: "alias",
      oobi: `localhost/oobi=2442?groupId=${groupId}`,
      groupId,
      createdAt: new Date(),
      getTag: jest.fn().mockReturnValue(groupId),
    };
    connectionStorage.findAllByQuery = jest.fn().mockResolvedValue([metadata]);
    expect(
      await connectionService.getMultisigLinkedContacts(groupId)
    ).toStrictEqual([
      {
        id: metadata.id,
        label: metadata.alias,
        connectionDate: metadata.createdAt.toISOString(),
        status: ConnectionStatus.CONFIRMED,
        oobi: metadata.oobi,
        groupId: metadata.groupId,
      },
    ]);
  });

  test("can resolve oobi with no name parameter", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const url = `${oobiPrefix}keriuuid`;
    
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    jest.spyOn(require("./utils"), "randomSalt").mockReturnValue("0ADQpus-mQmmO4mgWcT3ekDz");

    const op = await connectionService.resolveOobi(url);
    expect(op).toEqual({
      response: { i: url, dt: now },
      name: url,
      alias: "0ADQpus-mQmmO4mgWcT3ekDz",
      done: true,
      metadata: {
        oobi: `${oobiPrefix}${failUuid}`,
      },
    });
  });

  test("can resolve oobi with a name parameter (URL decoded)", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const url = `${oobiPrefix}keriuuid?name=alias%20with%20spaces`;
    const op = await connectionService.resolveOobi(url);
    expect(op).toEqual({
      response: { i: url, dt: now },
      name: url,
      metadata: {
        oobi: `${oobiPrefix}${failUuid}`,
      },
      alias: "alias with spaces",
      done: true,
    });
  });

  test("should throw if oobi is not resolving and we explicitly wait for completion", async () => {
    signifyClient.operations().get = jest
      .fn()
      .mockResolvedValue({ done: false });
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    jest.spyOn(Date.prototype, "getTime").mockReturnValueOnce(0);
    await expect(
      connectionService.resolveOobi(`${oobiPrefix}${failUuid}`)
    ).rejects.toThrowError(ConnectionService.FAILED_TO_RESOLVE_OOBI);
  });

  test("Should throw error when KERIA is offline", async () => {
    await expect(
      connectionService.getConnectionById("id")
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(connectionService.syncKeriaContacts()).rejects.toThrowError(
      Agent.KERIA_CONNECTION_BROKEN
    );
    await expect(
      connectionService.deleteConnectionById("id")
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(
      connectionService.resolveOobi("oobi-url")
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(connectionService.getOobi("id")).rejects.toThrowError(
      Agent.KERIA_CONNECTION_BROKEN
    );
  });

  test("can get all connections that have multi-sig related", async () => {
    connectionStorage.findAllByQuery = jest.fn().mockResolvedValue([
      {
        id: keriContacts[0].id,
        createdAt: now,
        alias: "keri",
        oobi: "oobi",
        groupId: "group-id",
        getTag: jest.fn().mockReturnValue("group-id"),
      },
    ]);
  });

  test("Should throw error if the oobi is empty", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    getOobiMock.mockResolvedValue({
      oobis: [],
      done: true,
    });
    const id = "id";
    await expect(connectionService.getOobi(id)).rejects.toThrow(
      new Error(ConnectionService.CANNOT_GET_OOBI)
    );
  });

  test("Can get multi-sig oobi", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    getOobiMock.mockResolvedValue({
      oobis: [
        `${oobiPrefix}oobi/EEGLKCqm1pENLuh9BW9EsbBxGnP0Pk8NMJ7_48Y_C3-6/agent/EJaQVSDkDEbPVxSe55vd9v5__Hb9inN8CwSbeB5qU5L_?name=t1`,
      ],
      done: true,
    });
    getIdentifier.mockResolvedValue({
      prefix: "EEGLKCqm1pENLuh9BW9EsbBxGnP0Pk8NMJ7_48Y_C3",
      states: {},
      group: {},
    });
    const id = "id";
    const KeriOobi = await connectionService.getOobi(id);
    expect(KeriOobi).toEqual(
      `${oobiPrefix}oobi/EEGLKCqm1pENLuh9BW9EsbBxGnP0Pk8NMJ7_48Y_C3-6?name=t1`
    );
  });

  test("should emit an event to add pending operation if the oobi resolving is not completing", async () => {
    getOobiMock.mockResolvedValue({
      oobis: [],
      done: false,
    });
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);

    saveOperationPendingMock.mockResolvedValueOnce({
      id: `${oobiPrefix}${failUuid}`,
      recordType: OperationPendingRecordType.Oobi,
    });

    jest.spyOn(Date.prototype, "getTime").mockReturnValueOnce(0);
    eventEmitter.emit = jest.fn();
    await connectionService.resolveOobi(`${oobiPrefix}${failUuid}`, false);
    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: `${oobiPrefix}${failUuid}`,
          recordType: OperationPendingRecordType.Oobi,
        },
      },
    });
  });

  test("Can delete stale local connection", async () => {
    const connectionId = "connection-id";
    await connectionService.deleteStaleLocalConnectionById(connectionId);
    expect(connectionStorage.deleteById).toBeCalledWith(connectionId);
  });

  test("connection exists in the database but not on Signify", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    contactGetMock.mockRejectedValue(
      new Error("request - 404 - SignifyClient message")
    );
    await expect(connectionService.getConnectionById("id")).rejects.toThrow(
      new Error(`${Agent.MISSING_DATA_ON_KERIA}: id`)
    );
  });

  test("Can get connection pending deletion keri", async () => {
    connectionStorage.findAllByQuery = jest.fn().mockResolvedValueOnce([
      {
        id: keriContacts[0].id,
        createdAt: now,
        alias: "keri",
        oobi: "oobi",
        groupId: "group-id",
        getTag: jest.fn().mockReturnValue("group-id"),
        pendingDeletion: true,
      },
    ]);
    expect(
      await connectionService.getConnectionsPendingDeletion()
    ).toMatchObject([keriContacts[0].id]);
    expect(connectionStorage.findAllByQuery).toBeCalledTimes(1);
  });

  test("Should mark connection is pending when start delete connection", async () => {
    const connectionProps = {
      id: keriContacts[0].id,
      createdAt: now,
      alias: "keri",
      getTag: jest.fn(),
    };

    connectionStorage.findById = jest
      .fn()
      .mockResolvedValueOnce(connectionProps);
    eventEmitter.emit = jest.fn();

    await connectionService.markConnectionPendingDelete(keriContacts[0].id);

    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.ConnectionRemoved,
      payload: {
        connectionId: keriContacts[0].id,
      },
    });
    expect(connectionStorage.update).toBeCalledWith(connectionProps);
  });

  test("Should return when result find connection by id is empty", async () => {
    connectionStorage.findById = jest.fn().mockResolvedValueOnce(undefined);

    await connectionService.markConnectionPendingDelete(keriContacts[0].id);

    expect(connectionStorage.update).not.toBeCalled();
  });

  test("Can delete connection by id if keria throw error 404 when delete contact", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    deleteContactMock = jest
      .fn()
      .mockRejectedValue(new Error("request - 404 - SignifyClient message"));

    await connectionService.deleteConnectionById(keriContacts[0].id);
    expect(connectionStorage.deleteById).toBeCalledWith(keriContacts[0].id);
  });

  test("Throws error if keria throw error with a non-404 error", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);

    const error = new Error("Some other error - 500");
    deleteContactMock.mockRejectedValueOnce(error);

    await expect(
      connectionService.deleteConnectionById(keriContacts[0].id)
    ).rejects.toThrow("Some other error - 500");
  });
  test("can get connection by id", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const connectionNote = {
      id: "note:id",
      title: "title",
      message: "message",
    };
    const mockHistoryIpexMessage = {
      id: "id",
      credentialType: "rare evo",
      historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
      type: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
      dt: new Date().toISOString(),
      connectionId: "connectionId",
    };
    const mockHistoryRevokeMessage = {
      id: "id",
      credentialType: "rare evo",
      historyType: ConnectionHistoryType.CREDENTIAL_REVOKED,
      type: ConnectionHistoryType.CREDENTIAL_REVOKED,
      dt: new Date().toISOString(),
      connectionId: "connectionId",
    };

    contactGetMock = jest.fn().mockReturnValue(
      Promise.resolve({
        alias: "alias",
        oobi: "oobi",
        id: "id",
        [`${KeriaContactKeyPrefix.CONNECTION_NOTE}:id`]:
          JSON.stringify(connectionNote),
        [`${KeriaContactKeyPrefix.HISTORY_IPEX}:id`]: JSON.stringify(
          mockHistoryIpexMessage
        ),
        [`${KeriaContactKeyPrefix.HISTORY_REVOKE}:id`]: JSON.stringify(
          mockHistoryRevokeMessage
        ),
      })
    );

    connectionStorage.findById = jest.fn().mockResolvedValue({
      id: keriContacts[0].id,
      createdAt: now,
      alias: "keri",
      oobi: "oobi",
      groupId: "group-id",
      getTag: jest.fn().mockReturnValue("group-id"),
    });

    expect(await connectionService.getConnectionById("id")).toEqual({
      id: "id",
      label: "alias",
      serviceEndpoints: ["oobi"],
      status: ConnectionStatus.CONFIRMED,
      connectionDate: nowISO,
      notes: [connectionNote],
      historyItems: [mockHistoryIpexMessage, mockHistoryRevokeMessage].map(
        (item) => ({
          type: item.historyType,
          timestamp: item.dt,
          credentialType: item.credentialType,
        })
      ),
    });
  });

  test("Can get connection pending keri", async () => {
    connectionStorage.findAllByQuery = jest.fn().mockResolvedValueOnce([
      {
        id: keriContacts[0].id,
        createdAt: now,
        alias: "keri",
        oobi: "oobi",
        groupId: "group-id",
        getTag: jest.fn().mockReturnValue("group-id"),
        pending: true,
      },
    ]);

    const result = await connectionService.getConnectionsPending();

    expect(connectionStorage.findAllByQuery).toHaveBeenCalledWith({
      pending: true,
      groupId: undefined,
    });

    expect(result).toEqual([
      expect.objectContaining({
        id: keriContacts[0].id,
        createdAt: now,
        alias: "keri",
        oobi: "oobi",
        groupId: "group-id",
        pending: true,
      }),
    ]);
  });
});
