import {
  Agent,
  DidDocumentRole,
  DidRecord,
  KeyType,
} from "@aries-framework/core";
import { IdentifierService } from "./identifierService";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../modules/generalStorage/repositories/identifierMetadataRecord";
import { IdentifierType } from "./identifierService.types";
import { ConnectionStatus, ConnectionType } from "../agent.types";
import { AriesAgent } from "../agent";
import { SignifyApi } from "../modules/signify/signifyApi";

// We are losing typing here but the Agent class is overly complex to setup for tests.
const agent = jest.mocked({
  modules: {
    generalStorage: {
      getAllAvailableIdentifierMetadata: jest.fn(),
      getAllArchivedIdentifierMetadata: jest.fn(),
      getIdentifierMetadata: jest.fn(),
      saveIdentifierMetadataRecord: jest.fn(),
      archiveIdentifierMetadata: jest.fn(),
      deleteIdentifierMetadata: jest.fn(),
      updateIdentifierMetadata: jest.fn(),
      getKeriIdentifiersMetadata: jest.fn(),
    },
  },
  dids: {
    getCreatedDids: jest.fn(),
    resolve: jest.fn(),
    create: jest.fn(),
  },
  genericRecords: {
    findById: jest.fn(),
    deleteById: jest.fn(),
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
  agent as any as Agent,
  basicStorage,
  signifyApi as any as SignifyApi
);

jest.mock("../../../core/agent/agent", () => ({
  AriesAgent: {
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
const did = "did:key:xyz";
const keyType = "ed25519";
const pkey = "pkey";

const didMetadataRecordProps = {
  id: did,
  displayName: "Identifier 1",
  signifyName: "uuid-here-1",
  colors,
  method: IdentifierType.KEY,
  createdAt: now,
  theme: 0,
};
const didMetadataRecord = new IdentifierMetadataRecord(didMetadataRecordProps);
const archivedMetadataRecord = new IdentifierMetadataRecord({
  ...didMetadataRecordProps,
  isArchived: true,
  theme: 0,
});

const keriMetadataRecordProps = {
  id: "aidHere",
  displayName: "Identifier 2",
  colors,
  method: IdentifierType.KERI,
  signifyName: "uuid-here",
  createdAt: now,
  theme: 0,
};
const keriMetadataRecord = new IdentifierMetadataRecord(
  keriMetadataRecordProps
);

const didRecord = new DidRecord({
  did: "did:key:xyz",
  role: DidDocumentRole.Created,
  createdAt: now,
});

const wrongDidRecord = new DidRecord({
  did: "did:keri:xyz",
  role: DidDocumentRole.Created,
  createdAt: now,
});

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

  test("can get all non-archived identifiers", async () => {
    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([didMetadataRecord, keriMetadataRecord]);
    expect(await identifierService.getIdentifiers()).toStrictEqual([
      {
        id: did,
        displayName: "Identifier 1",
        signifyName: "uuid-here-1",
        colors,
        method: IdentifierType.KEY,
        createdAtUTC: nowISO,
        theme: 0,
        isPending: false,
      },
      {
        id: keriMetadataRecord.id,
        displayName: "Identifier 2",
        signifyName: "uuid-here",
        colors,
        method: IdentifierType.KERI,
        createdAtUTC: nowISO,
        theme: 0,
        isPending: false,
      },
    ]);
  });

  test("can get all archived identifiers", async () => {
    agent.modules.generalStorage.getAllArchivedIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([didMetadataRecord, keriMetadataRecord]);
    expect(await identifierService.getIdentifiers(true)).toStrictEqual([
      {
        id: did,
        displayName: "Identifier 1",
        signifyName: "uuid-here-1",
        colors,
        method: IdentifierType.KEY,
        createdAtUTC: nowISO,
        theme: 0,
        isPending: false,
      },
      {
        id: keriMetadataRecord.id,
        displayName: "Identifier 2",
        signifyName: "uuid-here",
        colors,
        method: IdentifierType.KERI,
        createdAtUTC: nowISO,
        theme: 0,
        isPending: false,
      },
    ]);
  });

  test("can get all identifiers without error if there are none", async () => {
    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([]);
    expect(await identifierService.getIdentifiers()).toStrictEqual([]);
  });

  test("can get all archived identifiers without error if there are none", async () => {
    agent.modules.generalStorage.getAllArchivedIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([]);
    expect(await identifierService.getIdentifiers(true)).toStrictEqual([]);
  });

  test("search for non existant did", async () => {
    agent.dids.getCreatedDids = jest.fn().mockResolvedValue([]);
    expect(await identifierService.getIdentifier(did)).toEqual(undefined);
    expect(agent.dids.getCreatedDids).toBeCalledWith({ did });
  });

  test("incorrect did method returned ", async () => {
    const did = "did:key:xyz";
    agent.dids.getCreatedDids = jest.fn().mockResolvedValue([wrongDidRecord]);
    await expect(identifierService.getIdentifier(did)).rejects.toThrowError(
      IdentifierService.DID_MISSING_INCORRECT
    );
    expect(agent.dids.getCreatedDids).toBeCalledWith({ did });
  });

  test("resolved did key document missing actual did document entry", async () => {
    agent.dids.getCreatedDids = jest.fn().mockResolvedValue([didRecord]);
    agent.dids.resolve = jest.fn().mockResolvedValue({});
    await expect(identifierService.getIdentifier(did)).rejects.toThrowError(
      IdentifierService.DID_MISSING_DID_DOC
    );
    expect(agent.dids.getCreatedDids).toBeCalledWith({ did });
    expect(agent.dids.resolve).toBeCalledWith(did);
  });

  test("resolved did key document in unexpected format: missing vkey", async () => {
    agent.dids.getCreatedDids = jest.fn().mockResolvedValue([didRecord]);
    agent.dids.resolve = jest.fn().mockResolvedValue({ didDocument: {} });
    await expect(identifierService.getIdentifier(did)).rejects.toThrowError(
      IdentifierService.UNEXPECTED_DID_DOC_FORMAT
    );
    expect(agent.dids.getCreatedDids).toBeCalledWith({ did });
    expect(agent.dids.resolve).toBeCalledWith(did);
  });

  test("resolved did key document in unexpected format: missing vkey pubkey", async () => {
    agent.dids.getCreatedDids = jest.fn().mockResolvedValue([didRecord]);
    agent.dids.resolve = jest.fn().mockResolvedValue({
      didDocument: { verificationMethod: [{ id: "key0", type: keyType }] },
    });
    await expect(identifierService.getIdentifier(did)).rejects.toThrowError(
      IdentifierService.UNEXPECTED_DID_DOC_FORMAT
    );
    expect(agent.dids.getCreatedDids).toBeCalledWith({ did });
    expect(agent.dids.resolve).toBeCalledWith(did);
  });

  test("missing did identifier metadata record", async () => {
    agent.dids.getCreatedDids = jest.fn().mockResolvedValue([didRecord]);
    agent.dids.resolve = jest.fn().mockResolvedValue({
      didDocument: {
        verificationMethod: [
          { id: "key0", type: keyType, publicKeyBase58: pkey },
        ],
      },
    });
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(null);
    await expect(identifierService.getIdentifier(did)).rejects.toThrowError(
      IdentifierService.IDENTIFIER_METADATA_RECORD_MISSING
    );
    expect(agent.dids.getCreatedDids).toBeCalledWith({ did });
    expect(agent.dids.resolve).toBeCalledWith(did);
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      did
    );
  });

  test("can get a did identifier in detailed view", async () => {
    agent.dids.getCreatedDids = jest.fn().mockResolvedValue([didRecord]);
    agent.dids.resolve = jest.fn().mockResolvedValue({
      didDocument: {
        verificationMethod: [
          { id: "key0", type: keyType, publicKeyBase58: pkey },
        ],
      },
    });
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(didMetadataRecord);
    const result = await identifierService.getIdentifier(did);
    expect(agent.dids.getCreatedDids).toBeCalledWith({ did });
    expect(agent.dids.resolve).toBeCalledWith(did);
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      did
    );
    expect(result).toStrictEqual({
      type: IdentifierType.KEY, // @TODO: foconnor - IdentifierType maybe should be .KERI and .DID instead of .KEY.
      result: {
        id: did,
        displayName: didMetadataRecordProps.displayName,
        colors: didMetadataRecordProps.colors,
        controller: did,
        theme: 0,
        keyType,
        publicKeyBase58: pkey,
        createdAtUTC: nowISO,
        method: IdentifierType.KEY,
        isPending: false,
      },
    });
  });

  test("search for non existant keri aid (in db)", async () => {
    await expect(
      identifierService.getIdentifier(keriMetadataRecord.id)
    ).rejects.toThrowError(
      IdentifierService.IDENTIFIER_METADATA_RECORD_MISSING
    );
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
  });

  test("identifier exists in the database but not on Signify", async () => {
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    expect(await identifierService.getIdentifier(keriMetadataRecord.id)).toBe(
      undefined
    );
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      keriMetadataRecord.id
    );
    expect(signifyApi.getIdentifierByName).toBeCalledWith(
      keriMetadataRecordProps.signifyName
    );
  });

  test("can get a keri identifier in detailed view", async () => {
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    signifyApi.getIdentifierByName = jest
      .fn()
      .mockResolvedValue(aidReturnedBySignify);
    expect(
      await identifierService.getIdentifier(keriMetadataRecord.id)
    ).toStrictEqual({
      type: IdentifierType.KERI,
      result: {
        id: keriMetadataRecord.id,
        method: IdentifierType.KERI, // @TODO - foconnor: Redundant info.
        displayName: keriMetadataRecordProps.displayName,
        createdAtUTC: nowISO,
        colors,
        theme: 0,
        ...aidReturnedBySignify.state,
        signifyOpName: undefined,
        signifyName: "uuid-here",
        isPending: false,
      },
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
        method: IdentifierType.KERI,
        displayName,
        colors,
        theme: 0,
      })
    ).toBe(aid);
    expect(agent.dids.create).not.toBeCalledWith(); // Just in case
    expect(signifyApi.createIdentifier).toBeCalled();
    expect(
      agent.modules.generalStorage.saveIdentifierMetadataRecord
    ).toBeCalledWith(expect.any(IdentifierMetadataRecord));
    const newRecord: IdentifierMetadataRecord =
      agent.modules.generalStorage.saveIdentifierMetadataRecord.mock
        .calls[0][0];
    expect(newRecord.id).toEqual(aid);
    expect(newRecord.displayName).toEqual(displayName);
    expect(newRecord.colors).toEqual(colors);
    expect(newRecord.method).toEqual(IdentifierType.KERI);
    expect(newRecord.signifyName).toEqual(signifyName);
  });

  test("can create a did:key identifier", async () => {
    const did = "did:key:test";
    const displayName = "newDisplayName";
    agent.dids.create = jest.fn().mockResolvedValue({
      didState: {
        did,
      },
    });
    expect(
      await identifierService.createIdentifier({
        method: IdentifierType.KEY,
        displayName,
        colors,
        theme: 0,
      })
    ).toBe(did);
    expect(signifyApi.createIdentifier).not.toBeCalled(); // Just in case
    expect(agent.dids.create).toBeCalledWith({
      method: IdentifierType.KEY,
      options: { keyType: KeyType.Ed25519 },
    });
    expect(
      agent.modules.generalStorage.saveIdentifierMetadataRecord
    ).toBeCalledWith(expect.any(IdentifierMetadataRecord));
    const newRecord: IdentifierMetadataRecord =
      agent.modules.generalStorage.saveIdentifierMetadataRecord.mock
        .calls[0][0];
    expect(newRecord.id).toEqual(did);
    expect(newRecord.displayName).toEqual(displayName);
    expect(newRecord.colors).toEqual(colors);
    expect(newRecord.method).toEqual(IdentifierType.KEY);
  });

  test("can update a did:key identifier", async () => {
    const did = "did:key:test";
    const displayName = "newDisplayName";
    agent.dids.create = jest.fn().mockResolvedValue({
      didState: {
        did,
      },
    });
    await identifierService.createIdentifier({
      method: IdentifierType.KEY,
      displayName,
      colors,
      theme: 0,
    });
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(didMetadataRecord);
    await identifierService.updateIdentifier(did, {
      theme: 1,
      displayName: "test",
    });
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      did
    );
    expect(
      agent.modules.generalStorage.updateIdentifierMetadata
    ).toBeCalledWith(did, { theme: 1, displayName: "test" });
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
        method: IdentifierType.KERI,
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
        method: IdentifierType.KERI,
        displayName,
        colors,
        theme: 8,
      })
    ).rejects.toThrowError(IdentifierService.THEME_WAS_NOT_VALID);
  });

  test("should not create metadata record if did:key create result malformed", async () => {
    const displayName = "newDisplayName";
    agent.dids.create = jest.fn().mockResolvedValue({
      didState: {},
    });
    await expect(
      identifierService.createIdentifier({
        method: IdentifierType.KEY,
        displayName,
        colors,
        theme: 0,
      })
    ).rejects.toThrowError(
      IdentifierService.UNEXPECTED_MISSING_DID_RESULT_ON_CREATE
    );
    expect(signifyApi.createIdentifier).not.toBeCalled(); // Just in case
    expect(agent.dids.create).toBeCalledWith({
      method: IdentifierType.KEY,
      options: { keyType: KeyType.Ed25519 },
    });
    expect(
      agent.modules.generalStorage.saveIdentifierMetadataRecord
    ).not.toBeCalled();
  });

  // For archive/delete/restore tests there is no difference between did:key and keri
  test("can archive any identifier (re-archiving does nothing)", async () => {
    const id = "id";
    await identifierService.archiveIdentifier(id);
    expect(
      agent.modules.generalStorage.archiveIdentifierMetadata
    ).toBeCalledWith(id);
  });

  test("can delete an archived identifier (identifier and metadata record)", async () => {
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    await identifierService.deleteIdentifier(archivedMetadataRecord.id);
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id
    );
    expect(
      agent.modules.generalStorage.deleteIdentifierMetadata
    ).toBeCalledWith(archivedMetadataRecord.id);
  });

  test("cannot delete a non-archived credential", async () => {
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(didMetadataRecord);
    await expect(
      identifierService.deleteIdentifier(didMetadataRecord.id)
    ).rejects.toThrowError(IdentifierService.IDENTIFIER_NOT_ARCHIVED);
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      didMetadataRecord.id
    );
    expect(
      agent.modules.generalStorage.deleteIdentifierMetadata
    ).not.toBeCalled();
  });

  test("cannot delete a credential without a metadata record", async () => {
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(null);
    await expect(
      identifierService.deleteIdentifier(didMetadataRecord.id)
    ).rejects.toThrowError(
      IdentifierService.IDENTIFIER_METADATA_RECORD_MISSING
    );
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      didMetadataRecord.id
    );
    expect(
      agent.modules.generalStorage.deleteIdentifierMetadata
    ).not.toBeCalled();
  });

  test("can restore an archived credential", async () => {
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(archivedMetadataRecord);
    await identifierService.restoreIdentifier(archivedMetadataRecord.id);
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      archivedMetadataRecord.id
    );
    expect(
      agent.modules.generalStorage.updateIdentifierMetadata
    ).toBeCalledWith(archivedMetadataRecord.id, { isArchived: false });
  });

  test("cannot restore a non-archived credential", async () => {
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(didMetadataRecord);
    await expect(
      identifierService.restoreIdentifier(didMetadataRecord.id)
    ).rejects.toThrowError(IdentifierService.IDENTIFIER_NOT_ARCHIVED);
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      didMetadataRecord.id
    );
    expect(
      agent.modules.generalStorage.updateIdentifierMetadata
    ).not.toBeCalled();
  });

  test("cannot restore a credential without a metadata record", async () => {
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(null);
    await expect(
      identifierService.restoreIdentifier(didMetadataRecord.id)
    ).rejects.toThrowError(
      IdentifierService.IDENTIFIER_METADATA_RECORD_MISSING
    );
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      didMetadataRecord.id
    );
    expect(
      agent.modules.generalStorage.updateIdentifierMetadata
    ).not.toBeCalled();
  });

  test("Should call saveIdentifierMetadataRecord when there are un-synced KERI identifiers", async () => {
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
    agent.modules.generalStorage.getKeriIdentifiersMetadata = jest
      .fn()
      .mockReturnValue([]);
    await identifierService.syncKeriaIdentifiers();
    expect(
      agent.modules.generalStorage.saveIdentifierMetadataRecord
    ).toBeCalledTimes(1);
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
    agent.modules.generalStorage.getIdentifierMetadata = jest
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
        type: ConnectionType.KERI,
        connectionDate: new Date().toISOString(),
      },
    ];
    const metadata = {
      theme: 4,
      colors: ["#000000", "#000000"],
      displayName: "Multisig",
    };
    expect(
      await identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        metadata as IdentifierMetadataRecordProps,
        otherIdentifiers.length + 1
      )
    ).toBe(multisigIdentifier);
    expect(
      agent.modules.generalStorage.saveIdentifierMetadataRecord
    ).toBeCalledWith(
      expect.objectContaining({ id: multisigIdentifier, isPending: true })
    );

    signifyApi.createMultisig = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}1`, done: false },
      icpResult: {},
      name: "name",
    });
    expect(
      await identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        metadata as IdentifierMetadataRecordProps,
        1
      )
    ).toBe(`${multisigIdentifier}1`);
    expect(
      agent.modules.generalStorage.saveIdentifierMetadataRecord
    ).toBeCalledWith(
      expect.objectContaining({
        id: `${multisigIdentifier}1`,
        isPending: false,
      })
    );

    signifyApi.createMultisig = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}2`, done: true },
      icpResult: {},
      name: "name",
    });
    expect(
      await identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        metadata as IdentifierMetadataRecordProps,
        2
      )
    ).toBe(`${multisigIdentifier}2`);
    expect(
      agent.modules.generalStorage.saveIdentifierMetadataRecord
    ).toBeCalledWith(
      expect.objectContaining({
        id: `${multisigIdentifier}2`,
        isPending: false,
      })
    );

    const invalidOtherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        status: ConnectionStatus.CONFIRMED,
        type: ConnectionType.DIDCOMM,
        connectionDate: new Date().toISOString(),
      },
    ];
    await expect(
      identifierService.createMultisig(
        creatorIdentifier,
        invalidOtherIdentifiers,
        metadata as IdentifierMetadataRecordProps,
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
    agent.modules.generalStorage.getIdentifierMetadata = jest
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
        type: ConnectionType.KERI,
        connectionDate: new Date().toISOString(),
      },
    ];

    const delegatorContact = {
      id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyA",
      label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
      oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
      status: ConnectionStatus.CONFIRMED,
      type: ConnectionType.KERI,
      connectionDate: new Date().toISOString(),
    };
    const metadata = {
      theme: 4,
      colors: ["#000000", "#000000"],
      displayName: "Multisig",
    };
    expect(
      await identifierService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        metadata as IdentifierMetadataRecordProps,
        otherIdentifiers.length + 1,
        delegatorContact
      )
    ).toBe(multisigIdentifier);

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
    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([
        {
          method: IdentifierType.KERI,
          displayName: "displayName",
          id: "id",
          signifyName: "signifyName",
          createdAt: new Date(),
          colors: ["#000000", "#000000"],
          theme: 4,
        },
      ]);
    expect(
      await identifierService.joinMultisig(
        { id: "id", createdAt: new Date(), a: { d: "d" } },
        {
          theme: 4,
          colors: ["#000000", "#000000"],
          displayName: "Multisig",
        }
      )
    ).toBe(multisigIdentifier);
  });

  test("cannot join multisig by notification if exn messages are missing", async () => {
    signifyApi.getMultisigMessageBySaid = jest.fn().mockResolvedValue([]);
    await expect(
      identifierService.joinMultisig(
        { id: "id", createdAt: new Date(), a: { d: "d" } },
        {
          theme: 4,
          colors: ["#000000", "#000000"],
          displayName: "Multisig",
        }
      )
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
          method: IdentifierType.KERI,
          displayName,
          colors,
          theme: 0,
        },
        "delegationPrefix"
      )
    ).toBe(aid);
    expect(agent.dids.create).not.toBeCalledWith(); // Just in case
    expect(signifyApi.createDelegationIdentifier).toBeCalled();
    expect(
      agent.modules.generalStorage.saveIdentifierMetadataRecord
    ).toBeCalledWith(expect.any(IdentifierMetadataRecord));
    const newRecord: IdentifierMetadataRecord =
      agent.modules.generalStorage.saveIdentifierMetadataRecord.mock
        .calls[0][0];
    expect(newRecord.id).toEqual(aid);
    expect(newRecord.displayName).toEqual(displayName);
    expect(newRecord.colors).toEqual(colors);
    expect(newRecord.method).toEqual(IdentifierType.KERI);
    expect(newRecord.signifyName).toEqual(signifyName);
    expect(newRecord.isPending).toEqual(true);
  });

  test("should call signify.createDelegationIdentifier with the DID and throw an error", async () => {
    const displayName = "newDisplayName";
    expect(
      identifierService.createDelegatedIdentifier(
        {
          method: IdentifierType.KEY,
          displayName,
          colors,
          theme: 0,
        },
        "delegationPrefix"
      )
    ).rejects.toThrowError(IdentifierService.ONLY_CREATE_DELAGATION_WITH_AID);
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
      method: IdentifierType.KERI,
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
    expect(
      agent.modules.generalStorage.updateIdentifierMetadata
    ).toHaveBeenCalledWith(metadata.id, { isPending: false });
  });

  test("should call signify.checkDelegationSuccess with isPending is false and return true", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      method: IdentifierType.KERI,
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

  test("should call signify.checkDelegationSuccess with missing signify name and throw error", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      method: IdentifierType.KERI,
      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "",
      theme: 4,
    } as IdentifierMetadataRecord;

    expect(
      identifierService.checkDelegationSuccess(metadata)
    ).rejects.toThrowError(IdentifierService.AID_MISSING_SIGNIFY_NAME);
    expect(signifyApi.delegationApproved).toBeCalledTimes(0);
  });

  test("should call signify.rotateIdentifier with correct params", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      method: IdentifierType.KERI,
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

  test("should call signify.rotateIdentifier with missing signify name and throw error", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      method: IdentifierType.KERI,
      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "",
      theme: 4,
    } as IdentifierMetadataRecord;

    expect(identifierService.rotateIdentifier(metadata)).rejects.toThrowError(
      IdentifierService.AID_MISSING_SIGNIFY_NAME
    );
  });

  test("should call signify.rotateIdentifier with DID and throw error", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      method: IdentifierType.KEY,
      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "",
      theme: 4,
    } as IdentifierMetadataRecord;

    expect(identifierService.rotateIdentifier(metadata)).rejects.toThrowError(
      IdentifierService.ONLY_CREATE_ROTATION_WITH_AID
    );
  });

  test("should can rorate multisig with DID and throw error", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      method: IdentifierType.KEY,
      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "",
      theme: 4,
    } as IdentifierMetadataRecord;
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    expect(identifierService.rotateMultisig(metadata.id)).rejects.toThrowError(
      IdentifierService.ONLY_CREATE_ROTATION_WITH_AID
    );
  });

  test("should can rorate multisig with KERI multisig do not have manageAid and throw error", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      method: IdentifierType.KERI,
      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "",
      theme: 4,
    } as IdentifierMetadataRecord;
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    expect(identifierService.rotateMultisig(metadata.id)).rejects.toThrowError(
      IdentifierService.AID_IS_NOT_MULTI_SIG
    );
  });

  test("should can rorate multisig with KERI multisig do not have signifyName and throw error", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      method: IdentifierType.KERI,
      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "",
      theme: 4,
      multisigManageAid: "123",
    } as IdentifierMetadataRecord;
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    expect(identifierService.rotateMultisig(metadata.id)).rejects.toThrowError(
      IdentifierService.AID_MISSING_SIGNIFY_NAME
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
    agent.modules.generalStorage.getIdentifierMetadata = jest
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
    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([
        {
          method: IdentifierType.KERI,
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
      method: IdentifierType.KERI,
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
    agent.modules.generalStorage.getIdentifierMetadata = jest
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
    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([
        {
          method: IdentifierType.KERI,
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
      method: IdentifierType.KERI,
      colors: ["#e0f5bc", "#ccef8f"],
      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 4,
      multisigManageAid: "123",
    } as IdentifierMetadataRecord;
    agent.modules.generalStorage.getIdentifierMetadata = jest
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
      method: IdentifierType.KERI,
      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "name",
      theme: 4,
    } as IdentifierMetadataRecord;
    agent.modules.generalStorage.getIdentifierMetadata = jest
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

  test("should can join the multisig rotation with AID is DID and throw error", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      method: IdentifierType.KEY,
      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "",
      theme: 4,
      multisigManageAid: "123",
    } as IdentifierMetadataRecord;
    agent.modules.generalStorage.getIdentifierMetadata = jest
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
    ).rejects.toThrowError(IdentifierService.AID_MISSING_SIGNIFY_NAME);
  });

  test("should can join the multisig rotation", async () => {
    const multisigIdentifier = "newMultisigIdentifierAid";
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      method: IdentifierType.KERI,
      colors: ["#e0f5bc", "#ccef8f"],
      isPending: true,
      signifyOpName: "op123",
      signifyName: "name",
      theme: 4,
      multisigManageAid: "123",
    } as IdentifierMetadataRecord;
    agent.modules.generalStorage.getIdentifierMetadata = jest
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
    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([
        {
          method: IdentifierType.KERI,
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

    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([
        {
          method: IdentifierType.KERI,
          displayName: "displayName",
          id: "id1",
          signifyName: "signifyName",
          createdAt: new Date(),
          colors: ["#000000", "#000000"],
          theme: 4,
        },
      ]);
    await expect(
      identifierService.joinMultisig(
        { id: "id", createdAt: new Date(), a: { d: "d" } },
        {
          theme: 4,
          colors: ["#000000", "#000000"],
          displayName: "Multisig",
        }
      )
    ).rejects.toThrowError(IdentifierService.CANNOT_JOIN_MULTISIG_ICP);
  });

  test("cannot join multisig if the identifier does not have signifyName", async () => {
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

    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([
        {
          method: IdentifierType.KERI,
          displayName: "displayName",
          id: "id",
          signifyName: undefined,
          createdAt: new Date(),
          colors: ["#000000", "#000000"],
          theme: 4,
        },
      ]);
    await expect(
      identifierService.joinMultisig(
        { id: "id", createdAt: new Date(), a: { d: "d" } },
        {
          theme: 4,
          colors: ["#000000", "#000000"],
          displayName: "Multisig",
        }
      )
    ).rejects.toThrowError(IdentifierService.AID_MISSING_SIGNIFY_NAME);
  });

  test("Can get multisig icp details of 2 persons multi-sig", async () => {
    const identifierMetadata = {
      method: IdentifierType.KERI,
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
      type: ConnectionType.KERI,
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

    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([identifierMetadata]);

    AriesAgent.agent.connections.getConnectionKeriShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    AriesAgent.agent.connections.getConnections = jest
      .fn()
      .mockResolvedValue([]);

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
      method: IdentifierType.KERI,
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
      type: ConnectionType.KERI,
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

    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([identifierMetadata]);

    AriesAgent.agent.connections.getConnectionKeriShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    AriesAgent.agent.connections.getConnections = jest.fn().mockResolvedValue([
      {
        id: "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.PENDING,
        type: ConnectionType.DIDCOMM,
      },
      {
        id: "EDEp4MS9lFGBkV8sKFV0ldqcyiVd1iOEVZAhZnbqk6A3",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.CONFIRMED,
        type: ConnectionType.DIDCOMM,
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
      method: IdentifierType.KERI,
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
      type: ConnectionType.KERI,
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

    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([identifierMetadata]);

    AriesAgent.agent.connections.getConnectionKeriShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    AriesAgent.agent.connections.getConnections = jest.fn().mockResolvedValue([
      {
        id: "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.PENDING,
        type: ConnectionType.DIDCOMM,
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
      method: IdentifierType.KERI,
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
      type: ConnectionType.KERI,
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

    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([identifierMetadata]);

    jest
      .spyOn(AriesAgent.agent.connections, "getConnectionKeriShortDetailById")
      .mockResolvedValue(senderData);
    jest
      .spyOn(AriesAgent.agent.connections, "getConnections")
      .mockResolvedValue([
        {
          id: "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
          connectionDate: nowISO,
          label: "",
          logo: "logoUrl",
          status: ConnectionStatus.PENDING,
          type: ConnectionType.DIDCOMM,
        },
        {
          id: "EDEp4MS9lFGBkV8sKFV0ldqcyiVd1iOEVZAhZnbqk6A3",
          connectionDate: nowISO,
          label: "",
          logo: "logoUrl",
          status: ConnectionStatus.CONFIRMED,
          type: ConnectionType.DIDCOMM,
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
    AriesAgent.agent.connections.getConnectionKeriShortDetailById = jest
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
});
