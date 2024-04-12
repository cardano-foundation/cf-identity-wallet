import { ConnectionStatus } from "../agent.types";
import { ConnectionService } from "./connectionService";
import { SignifyApi } from "../modules/signify/signifyApi";
import { RecordType } from "../../storage/storage.types";

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
  getKeriaOnlineStatus: jest.fn(),
});

const connectionService = new ConnectionService(
  basicStorage,
  signifyApi as any as SignifyApi
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
const oobiPrefix = "oobi.";

describe("Connection service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
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
    signifyApi.getContacts = jest.fn().mockResolvedValue(keriContacts);
    expect(await connectionService.getConnections()).toEqual([
      {
        id: keriContacts[0].id,
        label: keriContacts[0].alias,
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

  test("can delete conenction by id", async () => {
    signifyApi.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    basicStorage.findAllByQuery = jest.fn().mockReturnValue([]);
    const connectionId = "connectionId";
    await connectionService.deleteConnectionById(connectionId);
    expect(basicStorage.deleteById).toBeCalledWith(connectionId);
    // expect(signifyApi.deleteContactById).toBeCalledWith(connectionId); // TODO: must open when Keria runs well
  });

  test("Should delete connection's notes when deleting that connection", async () => {
    signifyApi.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    basicStorage.findAllByQuery = jest.fn().mockReturnValue([
      {
        id: "uuid",
        content: {
          title: "title",
        },
      },
    ]);
    const connectionId = "connectionId";
    await connectionService.deleteConnectionById(connectionId);
    expect(basicStorage.deleteById).toBeCalledTimes(2);
  });

  test("can receive keri oobi", async () => {
    signifyApi.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
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
    signifyApi.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
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

  test("Should throw error when KERIA is offline", async () => {
    signifyApi.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(false);
    await expect(
      connectionService.getConnectionById("id")
    ).rejects.toThrowError(SignifyApi.KERIA_CONNECTION_BROKEN);
    await expect(connectionService.syncKeriaContacts()).rejects.toThrowError(
      SignifyApi.KERIA_CONNECTION_BROKEN
    );
    await expect(
      connectionService.receiveInvitationFromUrl("url/oobi")
    ).rejects.toThrowError(SignifyApi.KERIA_CONNECTION_BROKEN);
    await expect(
      connectionService.deleteConnectionById("id")
    ).rejects.toThrowError(SignifyApi.KERIA_CONNECTION_BROKEN);
  });
});
