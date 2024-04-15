import { IdentifierMetadataRecord } from "../records/identifierMetadataRecord";
import { Agent } from "../agent";
import { EventService } from "./eventService";
import { IdentifierService } from "./identifierService";
import { CredentialStorage } from "../records/credentialStorage";

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

const identifiersListMock = jest.fn();
const identifiersGetMock = jest.fn();
const identifiersCreateMock = jest.fn();
const identifiersRotateMock = jest.fn();

const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: identifiersListMock,
    get: identifiersGetMock,
    create: identifiersCreateMock,
    addEndRole: jest.fn(),
    interact: jest.fn(),
    rotate: identifiersRotateMock,
    members: jest.fn(),
  }),
  operations: () => ({
    get: jest.fn().mockImplementation((id: string) => {
      return {
        done: true,
        response: {
          i: id,
        },
      };
    }),
  }),
  oobis: () => ({
    get: jest.fn(),
    resolve: jest.fn().mockImplementation((name: string) => {
      return {
        done: true,
        response: {
          i: name,
        },
      };
    }),
  }),
  contacts: () => ({
    list: jest.fn(),
    get: jest.fn().mockImplementation((id: string) => {
      return {
        alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
        oobi: "oobi",
        id,
      };
    }),
    delete: jest.fn(),
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
const identifierStorage = jest.mocked({
  getIdentifierMetadata: jest.fn(),
  getAllIdentifierMetadata: jest.fn(),
  getKeriIdentifiersMetadata: jest.fn(),
  updateIdentifierMetadata: jest.fn(),
  createIdentifierMetadataRecord: jest.fn(),
});

const credentialStorage = jest.mocked({
  getAllCredentialMetadata: jest.fn(),
  deleteCredentialMetadata: jest.fn(),
  getCredentialMetadata: jest.fn(),
  getCredentialMetadataByCredentialRecordId: jest.fn(),
  getCredentialMetadataByConnectionId: jest.fn(),
  saveCredentialMetadataRecord: jest.fn(),
  updateCredentialMetadata: jest.fn(),
});

const agentServicesProps = {
  basicStorage: basicStorage as any,
  signifyClient: signifyClient as any,
  eventService: new EventService(),
  identifierStorage: identifierStorage as any,
  credentialStorage: credentialStorage as any,
};

const identifierService = new IdentifierService(agentServicesProps);

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getConnectionKeriShortDetailById: jest.fn(),
        getConnections: jest.fn(),
      },
    },
  },
}));

const now = new Date();
const nowISO = now.toISOString();
const colors: [string, string] = ["#fff", "#fff"];

const keriMetadataRecordProps = {
  id: "aidHere",
  displayName: "Identifier 2",
  colors,
  signifyName: "uuid-here",
  createdAt: now,
  theme: 0,
};
const archivedMetadataRecord = new IdentifierMetadataRecord({
  ...keriMetadataRecordProps,
  isArchived: true,
  theme: 0,
});

const keriMetadataRecord = new IdentifierMetadataRecord(
  keriMetadataRecordProps
);

const aidReturnedBySignify = {
  prefix: keriMetadataRecord.id,
  state: {
    s: "s",
    dt: "dt",
    kt: "kt",
    k: "k",
    nt: "nt",
    n: "n",
    bt: "bt",
    b: "b",
    di: "di",
  },
};

describe("Single sig service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test("can get all identifiers", async () => {
    identifierStorage.getAllIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([keriMetadataRecord]);
    expect(await identifierService.getIdentifiers()).toStrictEqual([
      {
        id: keriMetadataRecord.id,
        displayName: "Identifier 2",
        signifyName: "uuid-here",
        colors,
        createdAtUTC: nowISO,
        theme: 0,
        isPending: false,
      },
    ]);
  });
  test("can get all identifiers without error if there are none", async () => {
    identifierStorage.getAllIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([]);
    expect(await identifierService.getIdentifiers()).toStrictEqual([]);
  });

  test("identifier exists in the database but not on Signify", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    expect(await identifierService.getIdentifier(keriMetadataRecord.id)).toBe(
      undefined
    );
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
  });
  test("can get a keri identifier in detailed view", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    identifiersGetMock.mockResolvedValue(aidReturnedBySignify);
    expect(
      await identifierService.getIdentifier(keriMetadataRecord.id)
    ).toStrictEqual({
      id: keriMetadataRecord.id,
      displayName: keriMetadataRecordProps.displayName,
      createdAtUTC: nowISO,
      colors,
      theme: 0,
      ...aidReturnedBySignify.state,
      signifyOpName: undefined,
      signifyName: "uuid-here",
      isPending: false,
    });
  });
  test("can create a keri identifier", async () => {
    const aid = "newIdentifierAid";
    const displayName = "newDisplayName";
    identifiersCreateMock.mockResolvedValue({
      serder: {
        ked: {
          i: aid,
        },
      },
      op: jest.fn(),
    });
    expect(
      await identifierService.createIdentifier({
        displayName,
        colors,
        theme: 0,
      })
    ).toEqual({ identifier: aid, signifyName: expect.any(String) });
    expect(identifiersCreateMock).toBeCalled();
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledTimes(1);
  });
  test("cannot create a keri identifier if theme is not valid", async () => {
    const displayName = "newDisplayName";
    identifiersCreateMock.mockResolvedValue({
      serder: {
        ked: {
          i: "i",
        },
      },
      op: jest.fn(),
    });
    await expect(
      identifierService.createIdentifier({
        displayName,
        colors,
        theme: 3,
      })
    ).rejects.toThrowError(IdentifierService.THEME_WAS_NOT_VALID);
  });

  // For archive/delete/restore tests
  test("can delete an archived identifier (identifier and metadata record)", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    identifierStorage.updateIdentifierMetadata = jest.fn();
    await identifierService.deleteIdentifier(archivedMetadataRecord.id);
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id
    );
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id,
      {
        isDeleted: true,
      }
    );
  });

  test("cannot delete a non-archived credential", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    identifierStorage.updateIdentifierMetadata = jest.fn();
    await expect(
      identifierService.deleteIdentifier(keriMetadataRecord.id)
    ).rejects.toThrowError(IdentifierService.IDENTIFIER_NOT_ARCHIVED);
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
    expect(identifierStorage.updateIdentifierMetadata).not.toBeCalled();
  });

  test("can restore an archived credential", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    identifierStorage.updateIdentifierMetadata = jest.fn();
    await identifierService.restoreIdentifier(archivedMetadataRecord.id);
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id
    );
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id,
      { isArchived: false }
    );
  });

  test("cannot restore a non-archived credential", async () => {
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    await expect(
      identifierService.restoreIdentifier(keriMetadataRecord.id)
    ).rejects.toThrowError(IdentifierService.IDENTIFIER_NOT_ARCHIVED);
    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
    expect(identifierStorage.updateIdentifierMetadata).not.toBeCalled();
  });

  test("Should call createIdentifierMetadataRecord when there are un-synced KERI identifiers", async () => {
    identifiersListMock.mockReturnValue({
      aids: [
        {
          name: "12219bf2-613a-4d5f-8c5d-5d093e7035b3",
          prefix: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
          salty: {
            sxlt: "1AAHb70F3mVAOPNTX3GTp3lsfmwCxqLXa4MKDY-bR4oDlW_Env9lEPyo92Qya_OGK0QDeGOjzmEgXnRixFOm8uoaqYcrAs38qmZg",
            pidx: 0,
            kidx: 0,
            stem: "signify:aid",
            tier: "low",
            dcode: "E",
            icodes: ["A"],
            ncodes: ["A"],
            transferable: true,
          },
        },
      ],
      start: 1,
      end: 2,
      total: 1,
    });
    identifierStorage.getKeriIdentifiersMetadata = jest
      .fn()
      .mockReturnValue([]);
    await identifierService.syncKeriaIdentifiers();
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledTimes(1);
  });

  test("should call signify.rotateIdentifier with correct params", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      colors: ["#e0f5bc", "#ccef8f"],
      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 4,
    } as IdentifierMetadataRecord;
    identifiersRotateMock.mockResolvedValue({
      op: jest.fn().mockResolvedValue({
        done: true,
      }),
    });
    await identifierService.rotateIdentifier(metadata);
    expect(identifiersRotateMock).toHaveBeenCalledWith(metadata.signifyName);
  });
});
