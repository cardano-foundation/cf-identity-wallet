import { IdentifierService } from "./identifierService";
import { IdentifierMetadataRecord } from "../records/identifierMetadataRecord";
import { ConnectionStatus } from "../agent.types";
import { Agent } from "../agent";
import { SignifyApi } from "../modules/signify/signifyApi";
import { RecordType } from "../../storage/storage.types";
import { NotificationRoute } from "../modules/signify/signifyApi.types";

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
  getIdentifierByName: jest.fn(),
  createIdentifier: jest.fn(),
  getAllIdentifiers: jest.fn(),
  resolveOobi: jest.fn(),
  createMultisig: jest.fn(),
  getMultisigMessageBySaid: jest.fn(),
  joinMultisig: jest.fn(),
  createDelegationIdentifier: jest.fn(),
  interactDelegation: jest.fn(),
  delegationApproved: jest.fn(),
  rotateIdentifier: jest.fn(),
  rotateMultisigAid: jest.fn(),
  joinMultisigRotation: jest.fn(),
  getIdentifierById: jest.fn(),
  getMultisigMembers: jest.fn(),
  queryKeyState: jest.fn(),
});

const identifierService = new IdentifierService(
  basicStorage,
  signifyApi as any as SignifyApi
);

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

const groupMetadata = {
  groupId: "group-id",
  groupInitiator: true,
  groupCreated: false,
};

const keriMetadataRecordProps = {
  id: "aidHere",
  displayName: "Identifier 2",
  colors,

  signifyName: "uuid-here",
  createdAt: now,
  theme: 0,
  groupMetadata,
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

describe("Identifier service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("can get all identifiers", async () => {
    identifierService.getAllIdentifierMetadata = jest
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
        groupMetadata,
      },
    ]);
  });

  test("can get all identifiers without error if there are none", async () => {
    identifierService.getAllIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([]);
    expect(await identifierService.getIdentifiers()).toStrictEqual([]);
  });

  test("search for non existant keri aid (in db)", async () => {
    basicStorage.findById = jest.fn().mockResolvedValue(null);
    await expect(
      identifierService.getIdentifier(keriMetadataRecord.id)
    ).rejects.toThrowError(
      IdentifierService.IDENTIFIER_METADATA_RECORD_MISSING
    );
    expect(basicStorage.findById).toBeCalledWith(keriMetadataRecord.id);
  });

  test("identifier exists in the database but not on Signify", async () => {
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    expect(await identifierService.getIdentifier(keriMetadataRecord.id)).toBe(
      undefined
    );
    expect(identifierService.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
    expect(signifyApi.getIdentifierByName).toBeCalledWith(
      keriMetadataRecordProps.signifyName
    );
  });

  test("can get a keri identifier in detailed view", async () => {
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    signifyApi.getIdentifierByName = jest
      .fn()
      .mockResolvedValue(aidReturnedBySignify);
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
    const signifyName = "newUuidHere";
    signifyApi.createIdentifier = jest.fn().mockResolvedValue({
      identifier: aid,
      signifyName,
    });
    expect(
      await identifierService.createIdentifier({
        displayName,
        colors,
        theme: 0,
      })
    ).toEqual({
      identifier: aid,
      signifyName: expect.any(String),
    });
    expect(signifyApi.createIdentifier).toBeCalled();
    expect(basicStorage.save).toBeCalledTimes(1);
  });

  test("cannot create a keri identifier if theme is not valid", async () => {
    const aid = "newIdentifierAid";
    const displayName = "newDisplayName";
    const signifyName = "newUuidHere";
    signifyApi.createIdentifier = jest.fn().mockResolvedValue({
      identifier: aid,
      signifyName,
    });

    await expect(
      identifierService.createIdentifier({
        displayName,
        colors,
        theme: 3,
      })
    ).rejects.toThrowError(IdentifierService.THEME_WAS_NOT_VALID);
  });

  test("cannot create a did:key identifier if theme is not valid", async () => {
    const aid = "newIdentifierAid";
    const displayName = "newDisplayName";
    const signifyName = "newUuidHere";
    signifyApi.createIdentifier = jest.fn().mockResolvedValue({
      identifier: aid,
      signifyName,
    });
    await expect(
      identifierService.createIdentifier({
        displayName,
        colors,
        theme: 8,
      })
    ).rejects.toThrowError(IdentifierService.THEME_WAS_NOT_VALID);
  });
  // For archive/delete/restore tests
  test("can delete an archived identifier (identifier and metadata record)", async () => {
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    identifierService.updateIdentifierMetadata = jest.fn();
    await identifierService.deleteIdentifier(archivedMetadataRecord.id);
    expect(identifierService.getIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id
    );
    expect(identifierService.updateIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id,
      {
        isDeleted: true,
      }
    );
  });

  test("cannot delete a non-archived credential", async () => {
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    identifierService.updateIdentifierMetadata = jest.fn();
    await expect(
      identifierService.deleteIdentifier(keriMetadataRecord.id)
    ).rejects.toThrowError(IdentifierService.IDENTIFIER_NOT_ARCHIVED);
    expect(identifierService.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
    expect(identifierService.updateIdentifierMetadata).not.toBeCalled();
  });

  test("can restore an archived credential", async () => {
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    identifierService.updateIdentifierMetadata = jest.fn();

    await identifierService.restoreIdentifier(archivedMetadataRecord.id);
    expect(identifierService.getIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id
    );
    expect(identifierService.updateIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id,
      { isArchived: false }
    );
  });

  test("cannot restore a non-archived credential", async () => {
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);

    await expect(
      identifierService.restoreIdentifier(keriMetadataRecord.id)
    ).rejects.toThrowError(IdentifierService.IDENTIFIER_NOT_ARCHIVED);
    expect(identifierService.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
    expect(identifierService.updateIdentifierMetadata).not.toBeCalled();
  });

  test("Should call createIdentifierMetadataRecord when there are un-synced KERI identifiers", async () => {
    signifyApi.getAllIdentifiers = jest.fn().mockReturnValue({
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
    identifierService.getKeriIdentifiersMetadata = jest
      .fn()
      .mockReturnValue([]);
    await identifierService.syncKeriaIdentifiers();
    expect(basicStorage.save).toBeCalledTimes(1);
  });

  test("Can create a keri multisig with KERI contacts", async () => {
    const creatorIdentifier = "creatorIdentifier";
    const multisigIdentifier = "newMultisigIdentifierAid";
    const signifyName = "newUuidHere";
    signifyApi.getIdentifierByName = jest
      .fn()
      .mockResolvedValue(aidReturnedBySignify);
    signifyApi.createIdentifier = jest.fn().mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    signifyApi.resolveOobi = jest.fn().mockResolvedValue({
      name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
      metadata: {
        oobi: "testOobi",
      },
      done: true,
      error: null,
      response: {},
      alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
    });
    signifyApi.createMultisig = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}`, done: false },
      icpResult: {},
      name: "name",
    });
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,

        connectionDate: new Date().toISOString(),
        groupId: "group-id",
      },
    ];
    expect(
      await identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).toEqual({
      identifier: multisigIdentifier,
      signifyName: expect.any(String),
    });
    expect(basicStorage.save).toBeCalledWith(
      expect.objectContaining({ id: multisigIdentifier })
    );

    (keriMetadataRecord.groupMetadata as any).groupCreated = false;
    signifyApi.createMultisig = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}1`, done: false },
      icpResult: {},
      name: "name",
    });
    expect(
      await identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        1
      )
    ).toEqual({
      identifier: `${multisigIdentifier}1`,
      signifyName: expect.any(String),
    });

    expect(basicStorage.save).toBeCalledWith(
      expect.objectContaining({
        id: `${multisigIdentifier}1`,
      })
    );

    (keriMetadataRecord.groupMetadata as any).groupCreated = false;
    signifyApi.createMultisig = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}2`, done: true },
      icpResult: {},
      name: "name",
    });
    expect(
      await identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        2
      )
    ).toEqual({
      identifier: `${multisigIdentifier}2`,
      signifyName: expect.any(String),
    });

    expect(basicStorage.save).toBeCalledWith(
      expect.objectContaining({
        id: `${multisigIdentifier}2`,
      })
    );

    (keriMetadataRecord.groupMetadata as any).groupCreated = false;
    const invalidOtherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: new Date().toISOString(),
      },
    ];
    await expect(
      identifierService.createMultisig(
        creatorIdentifier,
        invalidOtherIdentifiers,
        invalidOtherIdentifiers.length + 1
      )
    ).rejects.toThrowError();
  });

  test("Can create a keri delegated multisig with KERI contacts", async () => {
    const creatorIdentifier = "creatorIdentifier";
    const multisigIdentifier = "newMultisigIdentifierAid";
    const signifyName = "newUuidHere";
    signifyApi.getIdentifierByName = jest
      .fn()
      .mockResolvedValue(aidReturnedBySignify);
    signifyApi.createIdentifier = jest.fn().mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    signifyApi.resolveOobi = jest.fn().mockResolvedValue({
      name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
      metadata: {
        oobi: "testOobi",
      },
      done: true,
      error: null,
      response: {},
      alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
    });
    signifyApi.createMultisig = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}`, done: false },
      icpResult: {},
      name: "name",
    });
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,

        connectionDate: new Date().toISOString(),
        groupId: "group-id",
      },
    ];

    const delegatorContact = {
      id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyA",
      label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
      oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
      status: ConnectionStatus.CONFIRMED,

      connectionDate: new Date().toISOString(),
    };
    expect(
      await identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1,
        delegatorContact
      )
    ).toEqual({
      identifier: multisigIdentifier,
      signifyName: expect.any(String),
    });

    expect(signifyApi.createMultisig).toBeCalledWith(
      {
        prefix: "aidHere",
        state: {
          b: "b",
          bt: "bt",
          di: "di",
          dt: "dt",
          k: "k",
          kt: "kt",
          n: "n",
          nt: "nt",
          s: "s",
        },
      },
      [{ state: {} }],
      expect.any(String),
      otherIdentifiers.length + 1,
      { state: {} }
    );
  });

  test("can join the multisig inception", async () => {
    const multisigIdentifier = "newMultisigIdentifierAid";
    Agent.agent.identifiers.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue({
        signifyName: "name",
      });
    basicStorage.findById = jest.fn().mockResolvedValue({
      content: {
        d: "d",
      },
    });
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: ["id"],
            rmids: ["id"],
          },
        },
      },
    ]);

    signifyApi.joinMultisig = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}`, done: false },
      icpResult: {},
      name: "name",
    });
    identifierService.getAllIdentifierMetadata = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id",
        signifyName: "signifyName",
        createdAt: new Date(),
        colors: ["#000000", "#000000"],
        theme: 0,
        groupMetadata,
      },
    ]);
    expect(
      await identifierService.joinMultisig("id", "d", {
        theme: 0,
        colors: ["#000000", "#000000"],
        displayName: "Multisig",
      })
    ).toEqual({
      identifier: multisigIdentifier,
      signifyName: expect.any(String),
    });
  });

  test("cannot join multisig by notification if exn messages are missing", async () => {
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([]);
    await expect(
      identifierService.joinMultisig("id", "d", {
        theme: 0,
        colors: ["#000000", "#000000"],
        displayName: "Multisig",
      })
    ).rejects.toThrowError();
  });

  test("should call signify.createDelegationIdentifier with the correct parameters and return the result", async () => {
    const aid = "newIdentifierAid";
    const displayName = "newDisplayName";
    const signifyName = "newUuidHere";
    signifyApi.createDelegationIdentifier = jest.fn().mockResolvedValue({
      identifier: aid,
      signifyName,
    });
    expect(
      await identifierService.createDelegatedIdentifier(
        {
          displayName,
          colors,
          theme: 0,
        },
        "delegationPrefix"
      )
    ).toBe(aid);
    expect(signifyApi.createDelegationIdentifier).toBeCalled();
    expect(basicStorage.save).toBeCalledTimes(1);
  });

  test("should call the interactDelegation method of the signify module with the given arguments", async () => {
    const signifyName = "exampleSignifyName";
    const delegatePrefix = "exampleDelegatePrefix";
    await identifierService.approveDelegation(signifyName, delegatePrefix);

    expect(signifyApi.interactDelegation).toHaveBeenCalledWith(
      signifyName,
      delegatePrefix
    );
  });

  test("should call signify.checkDelegationSuccess and update metadata isPending property to false", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 4,
    } as IdentifierMetadataRecord;

    signifyApi.delegationApproved = jest.fn().mockResolvedValue(true);

    expect(await identifierService.checkDelegationSuccess(metadata)).toEqual(
      true
    );

    expect(signifyApi.delegationApproved).toHaveBeenCalledWith(
      metadata.signifyName
    );
    expect(identifierService.updateIdentifierMetadata).toHaveBeenCalledWith(
      metadata.id,
      { isPending: false }
    );
  });

  test("should call signify.checkDelegationSuccess with isPending is false and return true", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      colors: ["#e0f5bc", "#ccef8f"],
      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 4,
    } as IdentifierMetadataRecord;

    expect(await identifierService.checkDelegationSuccess(metadata)).toEqual(
      true
    );
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
    await identifierService.rotateIdentifier(metadata);
    expect(signifyApi.rotateIdentifier).toHaveBeenCalledWith(
      metadata.signifyName
    );
    expect(signifyApi.delegationApproved).toBeCalledTimes(0);
  });

  test("should can rorate multisig with KERI multisig do not have manageAid and throw error", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "",
      theme: 4,
    } as IdentifierMetadataRecord;
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    expect(identifierService.rotateMultisig(metadata.id)).rejects.toThrowError(
      IdentifierService.AID_IS_NOT_MULTI_SIG
    );
  });

  test("should can rorate multisig with KERI multisig have members do not rotate it AID first and throw error", async () => {
    const multisigIdentifier = "newMultisigIdentifierAid";
    const signifyName = "newUuidHere";
    signifyApi.getIdentifierByName = jest
      .fn()
      .mockResolvedValue(aidReturnedBySignify);
    signifyApi.createIdentifier = jest.fn().mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });
    const keriMultisigRecord = {
      ...keriMetadataRecord,
      multisigManageAid: "123",
    };
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMultisigRecord);
    signifyApi.queryKeyState = jest.fn().mockResolvedValue({
      name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
      metadata: {
        oobi: "testOobi",
      },
      done: false,
      error: null,
      response: {
        i: "id",
      },
      alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
    });
    identifierService.getAllIdentifierMetadata = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id",
        signifyName: "signifyName",
        createdAt: new Date(),
        colors: ["#000000", "#000000"],
        theme: 4,
      },
    ]);
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      colors: ["#e0f5bc", "#ccef8f"],
      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 4,
      multisigManageAid: "123",
    } as IdentifierMetadataRecord;
    signifyApi.getMultisigMembers = jest.fn().mockResolvedValue({
      signing: [
        {
          aid: "ENYqRaAQBWtpS7fgCGirVy-zJNRcWu2ZUsRNBjzvrfR_",
          ends: {
            agent: {
              EGQnU0iNKuvURoeRenW7pZ5wA1Iyijo2EgscSYsK0hum: {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
        {
          aid: "EOpnB724NQqQa58Zqw-ZFEQplQ2hQXpbj6o2gKrzlix3",
          ends: {
            agent: {
              "EAOfcPsG_mHtrzw1TyOxlCiQQlLZn-KTUu4lUy7zB_Na": {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
        {
          aid: "EJUPirpdqcZpblLDyQ4P8XkD12wmQUqJb_6M7tUVZT4n",
          ends: {
            agent: {
              "EN6WVdOExj1n6ES-Wzk9yjskoXv_2aEqNEN2iDzttPJb": {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
      ],
    });
    expect(identifierService.rotateMultisig(metadata.id)).rejects.toThrowError(
      IdentifierService.NOT_FOUND_ALL_MEMBER_OF_MULTISIG
    );
  });

  test("should can rotate a keri multisig with KERI contacts", async () => {
    const multisigIdentifier = "newMultisigIdentifierAid";
    const signifyName = "newUuidHere";
    signifyApi.getIdentifierByName = jest
      .fn()
      .mockResolvedValue(aidReturnedBySignify);
    signifyApi.createIdentifier = jest.fn().mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    signifyApi.queryKeyState = jest.fn().mockResolvedValue({
      name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
      metadata: {
        oobi: "testOobi",
      },
      done: true,
      error: null,
      response: {
        i: "id",
      },
      alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
    });
    identifierService.getAllIdentifierMetadata = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id",
        signifyName: "signifyName",
        createdAt: new Date(),
        colors: ["#000000", "#000000"],
        theme: 4,
      },
    ]);
    signifyApi.rotateMultisigAid = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}`, done: false },
      icpResult: {},
      name: "name",
    });
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      colors: ["#e0f5bc", "#ccef8f"],
      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 4,
      multisigManageAid: "123",
    } as IdentifierMetadataRecord;
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    signifyApi.getMultisigMembers = jest.fn().mockResolvedValue({
      signing: [
        {
          aid: "ENYqRaAQBWtpS7fgCGirVy-zJNRcWu2ZUsRNBjzvrfR_",
          ends: {
            agent: {
              EGQnU0iNKuvURoeRenW7pZ5wA1Iyijo2EgscSYsK0hum: {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
        {
          aid: "EOpnB724NQqQa58Zqw-ZFEQplQ2hQXpbj6o2gKrzlix3",
          ends: {
            agent: {
              "EAOfcPsG_mHtrzw1TyOxlCiQQlLZn-KTUu4lUy7zB_Na": {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
        {
          aid: "EJUPirpdqcZpblLDyQ4P8XkD12wmQUqJb_6M7tUVZT4n",
          ends: {
            agent: {
              "EN6WVdOExj1n6ES-Wzk9yjskoXv_2aEqNEN2iDzttPJb": {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
      ],
    });
    expect(await identifierService.rotateMultisig(metadata.id)).toBe(
      multisigIdentifier
    );
  });

  test("should can join the multisig rotation with no notification and throw error", async () => {
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([]);
    expect(
      identifierService.joinMultisigRotation({
        id: "id",
        createdAt: new Date(),
        a: { d: "d" },
      })
    ).rejects.toThrowError(IdentifierService.EXN_MESSAGE_NOT_FOUND);
  });

  test("should can join the multisig rotation with AID is not multisig and throw error", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "name",
      theme: 4,
    } as IdentifierMetadataRecord;
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    basicStorage.findById = jest.fn().mockResolvedValue({
      content: {
        d: "d",
      },
    });
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            rstates: [{ i: "id", signifyName: "rstateSignifyName" }],
          },
        },
      },
    ]);

    signifyApi.getIdentifierById = jest.fn().mockResolvedValue([
      {
        name: "multisig",
        prefix: "prefix",
      },
    ]);
    expect(
      identifierService.joinMultisigRotation({
        id: "id",
        createdAt: new Date(),
        a: { d: "d" },
      })
    ).rejects.toThrowError(IdentifierService.AID_IS_NOT_MULTI_SIG);
  });

  test("should can join the multisig rotation", async () => {
    const multisigIdentifier = "newMultisigIdentifierAid";
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "name",
      theme: 4,
      multisigManageAid: "123",
    } as IdentifierMetadataRecord;
    identifierService.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    basicStorage.findById = jest.fn().mockResolvedValue({
      content: {
        d: "d",
      },
    });
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            rstates: [{ i: "id", signifyName: "rstateSignifyName" }],
          },
        },
      },
    ]);

    signifyApi.getIdentifierById = jest.fn().mockResolvedValue([
      {
        name: "multisig",
        prefix: "prefix",
      },
    ]);

    signifyApi.joinMultisigRotation = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}`, done: false },
      icpResult: {},
      name: "name",
    });
    identifierService.getAllIdentifierMetadata = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id",
        signifyName: "signifyName",
        createdAt: new Date(),
        colors: ["#000000", "#000000"],
        theme: 4,
        multisigManageAid: "123",
      },
    ]);
    expect(
      await identifierService.joinMultisigRotation({
        id: "id",
        createdAt: new Date(),
        a: { d: "d" },
      })
    ).toBe(multisigIdentifier);
  });

  test("cannot join multisig if there's no identifier matched", async () => {
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: ["id"],
            rmids: ["id"],
          },
        },
      },
    ]);

    identifierService.getAllIdentifierMetadata = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id1",
        signifyName: "signifyName",
        createdAt: new Date(),
        colors: ["#000000", "#000000"],
        theme: 4,
      },
    ]);
    await expect(
      identifierService.joinMultisig("id", "d", {
        theme: 4,
        colors: ["#000000", "#000000"],
        displayName: "Multisig",
      })
    ).rejects.toThrowError(IdentifierService.CANNOT_JOIN_MULTISIG_ICP);
  });

  test("Can get multisig icp details of 2 persons multi-sig", async () => {
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      colors: ["#000000", "#000000"],
      theme: 4,
    };

    const senderData = {
      id: "senderId",
      connectionDate: nowISO,
      label: "keri",
      status: ConnectionStatus.CONFIRMED,
    };
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: ["id", "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A"],
          },
          e: {
            icp: {
              kt: 2,
            },
          },
        },
      },
    ]);

    identifierService.getAllIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([identifierMetadata]);

    Agent.agent.connections.getConnectionKeriShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    Agent.agent.connections.getConnections = jest.fn().mockResolvedValue([]);

    const result = await identifierService.getMultisigIcpDetails({
      id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
      createdAt: new Date("2024-03-08T08:52:10.801Z"),
      a: {
        r: "/multisig/icp",
        d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
      },
    });
    expect(result.ourIdentifier.id).toBe(identifierMetadata.id);
    expect(result.sender.id).toBe(senderData.id);
    expect(result.otherConnections.length).toBe(0);
    expect(result.threshold).toBe(2);
  });

  test("Throw error if the Multi-sig join request contains unknown AIDs", async () => {
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      colors: ["#000000", "#000000"],
      theme: 4,
    };

    const senderData = {
      id: "senderId",
      connectionDate: nowISO,
      label: "keri",
      status: ConnectionStatus.CONFIRMED,
    };
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: [
              "id",
              "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1B",
              "senderId",
            ],
          },
        },
      },
    ]);

    identifierService.getAllIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([identifierMetadata]);

    Agent.agent.connections.getConnectionKeriShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    Agent.agent.connections.getConnections = jest.fn().mockResolvedValue([
      {
        id: "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.PENDING,
      },
      {
        id: "EDEp4MS9lFGBkV8sKFV0ldqcyiVd1iOEVZAhZnbqk6A3",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.CONFIRMED,
      },
    ]);

    await expect(
      identifierService.getMultisigIcpDetails({
        id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
        createdAt: new Date("2024-03-08T08:52:10.801Z"),
        a: {
          r: "/multisig/icp",
          d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
        },
      })
    ).rejects.toThrowError(IdentifierService.UNKNOWN_AIDS_IN_MULTISIG_ICP);
  });

  test("Can get multisig icp details of 3 persons multi-sig", async () => {
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      colors: ["#000000", "#000000"],
      theme: 4,
    };

    const senderData = {
      id: "senderId",
      connectionDate: nowISO,
      label: "keri",
      status: ConnectionStatus.CONFIRMED,
    };
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: [
              "id",
              "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
              "senderId",
            ],
          },
          e: {
            icp: {
              kt: 3,
            },
          },
        },
      },
    ]);

    identifierService.getAllIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([identifierMetadata]);

    Agent.agent.connections.getConnectionKeriShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    Agent.agent.connections.getConnections = jest.fn().mockResolvedValue([
      {
        id: "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.PENDING,
      },
    ]);
    const result = await identifierService.getMultisigIcpDetails({
      id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
      createdAt: new Date("2024-03-08T08:52:10.801Z"),
      a: {
        r: "/multisig/icp",
        d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
      },
    });
    expect(result.ourIdentifier.id).toBe(identifierMetadata.id);
    expect(result.sender.id).toBe(senderData.id);
    expect(result.otherConnections.length).toBe(1);
    expect(result.otherConnections[0].id).toBe(
      "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A"
    );
    expect(result.threshold).toBe(3);
  });

  test("Throw error if we do not control any member AID of the multi-sig", async () => {
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      colors: ["#000000", "#000000"],
      theme: 4,
    };

    const senderData = {
      id: "senderId",
      connectionDate: nowISO,
      label: "keri",
      status: ConnectionStatus.CONFIRMED,
    };
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: [
              "id1",
              "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
              "senderId",
            ],
          },
        },
      },
    ]);

    identifierService.getAllIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([identifierMetadata]);

    jest
      .spyOn(Agent.agent.connections, "getConnectionKeriShortDetailById")
      .mockResolvedValue(senderData);
    jest.spyOn(Agent.agent.connections, "getConnections").mockResolvedValue([
      {
        id: "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.PENDING,
      },
      {
        id: "EDEp4MS9lFGBkV8sKFV0ldqcyiVd1iOEVZAhZnbqk6A3",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.CONFIRMED,
      },
    ]);

    await expect(
      identifierService.getMultisigIcpDetails({
        id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
        createdAt: new Date("2024-03-08T08:52:10.801Z"),
        a: {
          r: "/multisig/icp",
          d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
        },
      })
    ).rejects.toThrowError(IdentifierService.CANNOT_JOIN_MULTISIG_ICP);
  });

  test("cannot get multi-sig details from an unknown sender (missing metadata)", async () => {
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: [
              "id1",
              "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
              "senderId",
            ],
          },
        },
      },
    ]);
    // @TODO - foconnor: This is not ideal as our identifier service is getting tightly coupled with the connection service.
    // Re-work this later.
    Agent.agent.connections.getConnectionKeriShortDetailById = jest
      .fn()
      .mockImplementation(() => {
        throw new Error("Some error from connection service");
      });
    await expect(
      identifierService.getMultisigIcpDetails({
        id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
        createdAt: new Date("2024-03-08T08:52:10.801Z"),
        a: {
          r: "/multisig/icp",
          d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
        },
      })
    ).rejects.toThrowError("Some error from connection service");
  });

  test("cannot get multi-sig details from a notification with no matching exn message", async () => {
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([]);
    await expect(
      identifierService.getMultisigIcpDetails({
        id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
        createdAt: new Date("2024-03-08T08:52:10.801Z"),
        a: {
          r: "/multisig/icp",
          d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
        },
      })
    ).rejects.toThrowError(
      `${IdentifierService.EXN_MESSAGE_NOT_FOUND} EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW`
    );
  });

  test("Can get KERI identifier by group id", async () => {
    Agent.agent.identifiers.getKeriIdentifierMetadataByGroupId = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    expect(
      await identifierService.getKeriIdentifierByGroupId(
        keriMetadataRecord.groupMetadata?.groupId as string
      )
    ).toStrictEqual({
      displayName: keriMetadataRecord.displayName,
      id: keriMetadataRecord.id,
      signifyName: keriMetadataRecord.signifyName,
      createdAtUTC: keriMetadataRecord.createdAt.toISOString(),
      colors: keriMetadataRecord.colors,
      theme: keriMetadataRecord.theme,
      isPending: keriMetadataRecord.isPending ?? false,
    });
    /**null result */
    Agent.agent.identifiers.getKeriIdentifierMetadataByGroupId = jest
      .fn()
      .mockResolvedValue(null);
    expect(
      await identifierService.getKeriIdentifierByGroupId(
        keriMetadataRecord.groupMetadata?.groupId as string
      )
    ).toStrictEqual(null);
  });

  test("Should throw errors when create KERI multisigs with invalid identifier", async () => {
    const creatorIdentifier = "creatorIdentifier";
    const identifierMetaData = {
      id: "creatorIdentifier",
      displayName: "Identifier 2",
      colors,
      signifyName: "uuid-here",
      createdAt: now,
      theme: 0,
    };
    Agent.agent.identifiers.getIdentifierMetadata = jest.fn().mockResolvedValue(
      new IdentifierMetadataRecord({
        ...identifierMetaData,
        groupMetadata: undefined,
      })
    );
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: new Date().toISOString(),
        groupId: "group-id",
      },
    ];
    /**Identifier doesn't have groupMetadata */
    await expect(
      identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).rejects.toThrowError(IdentifierService.MISSING_GROUP_METADATA);

    /**Identifier's group is already created */
    Agent.agent.identifiers.getIdentifierMetadata = jest.fn().mockResolvedValue(
      new IdentifierMetadataRecord({
        ...identifierMetaData,
        groupMetadata: {
          groupId: "123",
          groupCreated: true,
          groupInitiator: true,
        },
      })
    );
    await expect(
      identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).rejects.toThrowError(IdentifierService.GROUP_ALREADY_EXISTs);

    /**Identifier's not groupInitiator */
    Agent.agent.identifiers.getIdentifierMetadata = jest.fn().mockResolvedValue(
      new IdentifierMetadataRecord({
        ...identifierMetaData,
        groupMetadata: {
          groupId: "123",
          groupCreated: false,
          groupInitiator: false,
        },
      })
    );
    await expect(
      identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).rejects.toThrowError(IdentifierService.ONLY_ALLOW_GROUP_INITIATOR);
  });

  test("Should throw errors when create KERI multisigs with invalid contacts", async () => {
    const creatorIdentifier = "creatorIdentifier";
    const identifierMetaData = {
      id: "creatorIdentifier",
      displayName: "Identifier 2",
      colors,
      signifyName: "uuid-here",
      createdAt: now,
      theme: 0,
    };
    Agent.agent.identifiers.getIdentifierMetadata = jest.fn().mockResolvedValue(
      new IdentifierMetadataRecord({
        ...identifierMetaData,
        groupMetadata: {
          groupCreated: false,
          groupInitiator: true,
          groupId: "not-group-id",
        },
      })
    );
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: new Date().toISOString(),
        groupId: "group-id",
      },
    ];
    await expect(
      identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).rejects.toThrowError(IdentifierService.ONLY_ALLOW_LINKED_CONTACTS);
  });

  test("Can get unhandled Multisig Identifier notifications", async () => {
    const basicRecord = {
      _tags: {
        isDismiss: true,
        type: RecordType.NOTIFICATION_KERI,
        route: NotificationRoute.MultiSigIcp,
      },
      id: "AIeGgKkS23FDK4mxpfodpbWhTydFz2tdM64DER6EdgG-",
      createdAt: "2024-03-25T09:33:05.325Z",
      content: {
        r: NotificationRoute.MultiSigIcp,
        d: "EF6Nmxz8hs0oVc4loyh2J5Sq9H3Z7apQVqjO6e4chtsp",
      },
      type: RecordType.NOTIFICATION_KERI,
    };
    basicStorage.findAllByQuery = jest.fn().mockResolvedValue([basicRecord]);
    expect(
      await identifierService.getUnhandledMultisigIdentifiers()
    ).toStrictEqual([
      {
        id: basicRecord.id,
        createdAt: basicRecord.createdAt,
        a: basicRecord.content,
      },
    ]);
  });

  test("Should pass the filter throught findAllByQuery when call getUnhandledMultisigIdentifiers", async () => {
    basicStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
    await identifierService.getUnhandledMultisigIdentifiers({
      isDismissed: false,
    });
    expect(basicStorage.findAllByQuery).toBeCalledWith(
      RecordType.NOTIFICATION_KERI,
      {
        route: NotificationRoute.MultiSigIcp,
        isDismissed: false,
        $or: [
          { route: NotificationRoute.MultiSigIcp },
          {
            route: NotificationRoute.MultiSigRot,
          },
        ],
      }
    );
  });
});
