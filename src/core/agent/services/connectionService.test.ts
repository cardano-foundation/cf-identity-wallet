import { ConnectionStatus, KeriConnectionType } from "../agent.types";
import { ConnectionService } from "./connectionService";
import { EventService } from "./eventService";
import { ConfigurationService } from "../../configuration";
import { Agent } from "../agent";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { ConnectionHistoryType } from "./connection.types";

const contactListMock = jest.fn();
const deleteContactMock = jest.fn();
const getOobiMock = jest.fn();
const getIdentifier = jest.fn();
const contactGetMock = jest.fn().mockImplementation((id: string) => {
  return {
    alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
    oobi: "oobi",
    id,
  };
});

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

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventService: new EventService(),
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
  save: jest.fn(),
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
const ipexMessageStorage = jest.mocked({
  createIpexMessageRecord: jest.fn(),
  getIpexMessageMetadataByConnectionId:
    getIpexMessageMetadataByConnectionIdMock,
  deleteIpexMessageMetadata: jest.fn(),
});

const connectionService = new ConnectionService(
  agentServicesProps,
  connectionStorage as any,
  connectionNoteStorage as any,
  credentialStorage as any,
  ipexMessageStorage as any,
  operationPendingStorage as any
);

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      getKeriaOnlineStatus: jest.fn(),
      identifiers: { getKeriIdentifierByGroupId: jest.fn() },
      signifyNotifications: {
        addPendingOperationToQueue: jest.fn(),
      },
    },
  },
}));

jest.mock("uuid", () => {
  return {
    v4: () => "uuid",
  };
});

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
const oobiPrefix = "http://oobi.com/oobi/";

describe("Connection service of agent", () => {
  beforeAll(async () => {
    await new ConfigurationService().start();
  });
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should return connection type to trigger UI to create a new identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const groupId = "123";
    const oobi = `http://localhost/oobi=3423?groupId=${groupId}`;
    signifyClient.oobis().resolve = jest.fn().mockImplementation((url) => {
      return { name: url, response: { i: "id" } };
    });
    Agent.agent.identifiers.getKeriIdentifierByGroupId = jest
      .fn()
      .mockResolvedValue(null);

    const result = await connectionService.connectByOobiUrl(oobi);
    expect(result).toStrictEqual({
      type: KeriConnectionType.MULTI_SIG_INITIATOR,
      groupId,
      connection: {
        groupId,
        id: oobi,
        label: "uuid",
        oobi: `${oobiPrefix}${failUuid}`,
        status: ConnectionStatus.CONFIRMED,
        connectionDate: now,
      },
    });
    expect(connectionStorage.save).toBeCalled();
  });

  test("Can create groupId connections for existing pending multi-sigs", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const groupId = "123";
    const oobi = `http://localhost/oobi=3423?groupId=${groupId}`;
    signifyClient.oobis().resolve = jest.fn().mockImplementation((url) => {
      return { alias: "alias", name: url, response: { i: "id" } };
    });
    Agent.agent.identifiers.getKeriIdentifierByGroupId = jest
      .fn()
      .mockResolvedValue({
        displayName: "displayName",
        id: "id",
        signifyName: "uuid",
        createdAtUTC: new Date().toISOString(),
        theme: 0,
        isPending: false,
        groupMetadata: {
          groupId,
          groupCreated: false,
          groupInitiator: true,
        },
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
    await connectionService.createConnectionNote(connectionId, note);
    expect(connectionNoteStorage.save).toBeCalledWith({
      id: expect.any(String),
      title: "title",
      message: "message",
      connectionId,
    });
  });

  test("can delete connection note with id", async () => {
    const connectionNoteId = "connectionId";
    await connectionService.deleteConnectionNoteById(connectionNoteId);
    expect(connectionNoteStorage.deleteById).toBeCalledWith(connectionNoteId);
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
    const connectionToUpdate = {
      id: "id",
      title: "title",
      message: "message",
    };
    connectionNoteStorage.findById = jest
      .fn()
      .mockResolvedValue(connectionToUpdate);
    const connectionId = "connectionId";
    const note = {
      title: "title",
      message: "message2",
    };
    await connectionService.updateConnectionNoteById(connectionId, note);
    expect(connectionNoteStorage.update).toBeCalledWith({
      ...connectionToUpdate,
      title: "title",
      message: "message2",
    });
  });

  test("can delete conenction by id", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    connectionNoteStorage.findAllByQuery = jest.fn().mockReturnValue([]);
    getIpexMessageMetadataByConnectionIdMock.mockResolvedValueOnce([]);
    const connectionId = "connectionId";
    await connectionService.deleteConnectionById(connectionId);
    expect(connectionStorage.deleteById).toBeCalledWith(connectionId);
    // expect(deleteContactMock).toBeCalledWith(connectionId); // it should be uncommented later when deleting on KERIA is re-enabled
  });

  test("Should delete connection's notes & history when deleting that connection", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    connectionNoteStorage.findAllByQuery = jest.fn().mockReturnValue([
      {
        id: "uuid",
        title: "title",
      },
    ]);
    getIpexMessageMetadataByConnectionIdMock.mockResolvedValueOnce([
      {
        id: "id",
        credentialType: "rare evo",
        content: {},
        historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
        createdAt: new Date(),
        connectionId: "connectionId",
      },
    ]);
    const connectionId = "connectionId";
    await connectionService.deleteConnectionById(connectionId);
    expect(connectionNoteStorage.deleteById).toBeCalledTimes(1);
    expect(ipexMessageStorage.deleteIpexMessageMetadata).toBeCalledTimes(1);
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
    const signifyName = "keriuuid";
    const KeriOobi = await connectionService.getOobi(
      signifyName,
      "alias with spaces"
    );
    expect(KeriOobi).toEqual(
      `${oobiPrefix}${signifyName}?name=alias+with+spaces`
    );
  });

  test("can get KERI OOBI with alias and groupId", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    getOobiMock.mockImplementation((name: string) => {
      return {
        oobis: [`${oobiPrefix}${name}`],
        done: true,
      };
    });
    const signifyName = "keriuuid";
    const KeriOobi = await connectionService.getOobi(
      signifyName,
      "alias",
      "123"
    );
    expect(KeriOobi).toEqual(
      `${oobiPrefix}${signifyName}?name=alias&groupId=123`
    );
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
    const signifyName = "keriuuid";
    const KeriOobi = await connectionService.getOobi(signifyName);
    expect(KeriOobi).toEqual(oobiPrefix + signifyName);
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
    const op = await connectionService.resolveOobi(url);
    expect(op).toEqual({
      response: { i: url, dt: now },
      name: url,
      alias: expect.any(String),
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
    await expect(connectionService.getOobi("name")).rejects.toThrowError(
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
    const signifyName = "keriuuid";
    await expect(connectionService.getOobi(signifyName)).rejects.toThrow(
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
    const signifyName = "keriuuid";
    const KeriOobi = await connectionService.getOobi(signifyName);
    expect(KeriOobi).toEqual(
      `${oobiPrefix}oobi/EEGLKCqm1pENLuh9BW9EsbBxGnP0Pk8NMJ7_48Y_C3-6?name=t1`
    );
  });

  test("should save pending operation if the oobi resolving is not completing", async () => {
    getOobiMock.mockResolvedValue({
      oobis: [],
      done: false,
    });
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    jest.spyOn(Date.prototype, "getTime").mockReturnValueOnce(0);
    await connectionService.resolveOobi(`${oobiPrefix}${failUuid}`, false);
    expect(operationPendingStorage.save).toBeCalledWith({
      id: `${oobiPrefix}${failUuid}`,
      recordType: OperationPendingRecordType.Oobi,
    });
    expect(
      Agent.agent.signifyNotifications.addPendingOperationToQueue
    ).toBeCalledTimes(1);
  });

  test("Can get connection History by id", async () => {
    jest.restoreAllMocks();
    const connectionId = "connectionId";
    const date1 = new Date("Sat Jul 27 2024 15:02:30 GMT+0700");
    const date2 = new Date("Sat Jul 27 2024 15:45:04 GMT+0700");
    const date3 = new Date("Sat Jul 27 2024 15:30:34 GMT+0700");
    getIpexMessageMetadataByConnectionIdMock.mockResolvedValue([
      {
        id: "id-1",
        content: {
          exn: {
            r: "/ipex/grant",
            e: {
              acdc: {
                d: "EN_tsGwSUI63SYoSiiN8qsysUT8bnka9gZEka8PG_oVK",
              },
            },
          },
        },
        credentialType: "IIW 2024 Demo Day Attendee",
        connectionId,
        historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
        createdAt: date1,
      },
      {
        id: "id-2",
        content: {
          exn: {
            r: "/ipex/apply",
            e: {
              acdc: {
                d: "EN_tsGwSUI63SYoSiiN8qsysUT8bnka9gZEka8PG_oVQ",
              },
            },
          },
        },
        credentialType: "IIW 2024 Demo Day Attendee",
        connectionId,
        historyType: ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT,
        createdAt: date2,
      },
      {
        id: "id-3",
        content: {
          exn: {
            r: "/ipex/grant",
            e: {
              acdc: {
                d: "EN_tsGwSUI63SYoSiiN8qsysUT8bnka9gZEka8PG_oVQ",
              },
            },
          },
        },
        credentialType: "IIW 2024 Demo Day Attendee",
        connectionId,
        historyType: ConnectionHistoryType.CREDENTIAL_REVOKED,
        createdAt: date3,
      },
    ]);
    const histories = await connectionService.getConnectionHistoryById(
      connectionId
    );
    expect(histories).toEqual([
      {
        type: ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT,
        timestamp: date2.toISOString(),
        credentialType: "IIW 2024 Demo Day Attendee",
      },
      {
        type: ConnectionHistoryType.CREDENTIAL_REVOKED,
        timestamp: date3.toISOString(),
        credentialType: "IIW 2024 Demo Day Attendee",
      },
      {
        type: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
        timestamp: date1.toISOString(),
        credentialType: "IIW 2024 Demo Day Attendee",
      },
    ]);
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
});
