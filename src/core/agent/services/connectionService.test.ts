import { ConnectionStatus } from "../agent.types";
import { ConnectionService } from "./connectionService";
import { EventService } from "./eventService";
import { CredentialStorage, IdentifierStorage } from "../records";
import { Agent } from "../agent";

const basicStorage = jest.mocked({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const contactListMock = jest.fn();
const deleteContactMock = jest.fn();

const uuidToThrow = "throwMe";
const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    addEndRole: jest.fn(),
    interact: jest.fn(),
    rotate: jest.fn(),
    members: jest.fn(),
  }),
  operations: () => ({
    get: jest.fn().mockImplementation((id: string) => {
      if (id === `${oobiPrefix}${uuidToThrow}`) {
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
    get: jest.fn().mockImplementation((name: string) => {
      return {
        oobis: [`${oobiPrefix}${name}`],
        done: true,
      };
    }),
    resolve: jest.fn().mockImplementation((name: string) => {
      if (name === `${oobiPrefix}${uuidToThrow}`) {
        return {
          done: false,
          name,
        };
      }
      return {
        done: true,
        response: {
          i: name,
        },
        name,
      };
    }),
  }),
  contacts: () => ({
    list: contactListMock,
    get: jest.fn().mockImplementation((id: string) => {
      return {
        alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
        oobi: "oobi",
        id,
      };
    }),
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

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      getKeriaOnlineStatus: jest.fn(),
    },
  },
}));

const session = {};

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

const connectionService = new ConnectionService(
  agentServicesProps,
  connectionStorage as any,
  connectionNoteStorage as any,
  new CredentialStorage(session as any)
);

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
const oobiPrefix = "http://localhost:3902/oobi.";

describe("Connection service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test("can get all connections", async () => {
    connectionStorage.getAll = jest.fn().mockResolvedValue([
      {
        id: keriContacts[0].id,
        createdAt: now,
        alias: "keri",
        oobi: "oobi",
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
    const connectionId = "connectionId";
    await connectionService.deleteConnectionById(connectionId);
    expect(connectionStorage.deleteById).toBeCalledWith(connectionId);
    // expect(deleteContactMock).toBeCalledWith(connectionId); // it should be uncommented later when deleting on KERIA is re-enabled
  });

  test("Should delete connection's notes when deleting that connection", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    connectionNoteStorage.findAllByQuery = jest.fn().mockReturnValue([
      {
        id: "uuid",
        title: "title",
      },
    ]);
    const connectionId = "connectionId";
    await connectionService.deleteConnectionById(connectionId);
    expect(connectionNoteStorage.deleteById).toBeCalledTimes(1);
    expect(connectionNoteStorage.deleteById).toBeCalledTimes(1);
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
    signifyClient.oobis().get = jest.fn().mockImplementation((name: string) => {
      return `${oobiPrefix}${name}`;
    });
    const signifyName = "keriuuid";
    const KeriOobi = await connectionService.getOobi(
      signifyName,
      "alias with spaces"
    );
    expect(KeriOobi).toEqual(
      `${oobiPrefix}${signifyName}?name=alias%20with%20spaces`
    );
  });

  test("can get connection keri (short detail view) by id", async () => {
    connectionStorage.findById = jest.fn().mockResolvedValue({
      id: keriContacts[0].id,
      createdAt: now,
      alias: "keri",
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
    signifyClient.oobis().get = jest.fn().mockImplementation((name: string) => {
      return `${oobiPrefix}${name}`;
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

  test("can resolve oobi with no name parameter", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const url = `${oobiPrefix}keriuuid`;
    const op = await connectionService.resolveOobi(url);
    expect(op).toEqual({
      response: { i: url },
      name: url,
      alias: expect.any(String),
      done: true,
    });
  });

  test("can resolve oobi with a name parameter (URL decoded)", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const url = `${oobiPrefix}keriuuid?name=alias%20with%20spaces`;
    const op = await connectionService.resolveOobi(url);
    expect(op).toEqual({
      response: { i: url },
      name: url,
      alias: "alias with spaces",
      done: true,
    });
  });

  test("should timeout if oobi resolving is not completing", async () => {
    signifyClient.operations().get = jest
      .fn()
      .mockResolvedValue({ done: false });
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    await expect(
      connectionService.resolveOobi(`${oobiPrefix}${uuidToThrow}`)
    ).rejects.toThrowError(ConnectionService.FAILED_TO_RESOLVE_OOBI);
  }, 15251);

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
  });
});
