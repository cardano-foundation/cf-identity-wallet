import {
  Agent,
  DidDocumentRole,
  DidRecord,
  KeyType,
} from "@aries-framework/core";
import { IdentifierService } from "./identifierService";
import { IdentifierMetadataRecord } from "../modules/generalStorage/repositories/identifierMetadataRecord";
import { IdentifierType } from "./identifierService.types";

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
    },
    signify: {
      getIdentifierByName: jest.fn(),
      createIdentifier: jest.fn(),
    },
  },
  dids: {
    getCreatedDids: jest.fn(),
    resolve: jest.fn(),
    create: jest.fn(),
  },
});
const identifierService = new IdentifierService(agent as any as Agent);

const now = new Date();
const nowISO = now.toISOString();
const colors: [string, string] = ["#fff", "#fff"];
const did = "did:key:xyz";
const keyType = "ed25519";
const pkey = "pkey";

const didMetadataRecordProps = {
  id: did,
  displayName: "Identifier 1",
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

  test("can get all non-archived identities", async () => {
    agent.modules.generalStorage.getAllAvailableIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([didMetadataRecord, keriMetadataRecord]);
    expect(await identifierService.getIdentifiers()).toStrictEqual([
      {
        id: did,
        displayName: "Identifier 1",
        colors,
        method: IdentifierType.KEY,
        createdAtUTC: nowISO,
        theme: 0,
      },
      {
        id: keriMetadataRecord.id,
        displayName: "Identifier 2",
        colors,
        method: IdentifierType.KERI,
        createdAtUTC: nowISO,
        theme: 0,
      },
    ]);
  });

  test("can get all archived identities", async () => {
    agent.modules.generalStorage.getAllArchivedIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([didMetadataRecord, keriMetadataRecord]);
    expect(await identifierService.getIdentifiers(true)).toStrictEqual([
      {
        id: did,
        displayName: "Identifier 1",
        colors,
        method: IdentifierType.KEY,
        createdAtUTC: nowISO,
        theme: 0,
      },
      {
        id: keriMetadataRecord.id,
        displayName: "Identifier 2",
        colors,
        method: IdentifierType.KERI,
        createdAtUTC: nowISO,
        theme: 0,
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
    expect(agent.modules.signify.getIdentifierByName).toBeCalledWith(
      keriMetadataRecordProps.signifyName
    );
  });

  test("can get a keri identifier in detailed view", async () => {
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    agent.modules.signify.getIdentifierByName = jest
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
      },
    });
  });

  test("can create a keri identifier", async () => {
    const aid = "newIdentifierAid";
    const displayName = "newDisplayName";
    const signifyName = "newUuidHere";
    agent.modules.signify.createIdentifier = jest.fn().mockResolvedValue({
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
    expect(agent.modules.signify.createIdentifier).toBeCalled();
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
    expect(agent.modules.signify.createIdentifier).not.toBeCalled(); // Just in case
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
    agent.modules.signify.createIdentifier = jest.fn().mockResolvedValue({
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
    agent.modules.signify.createIdentifier = jest.fn().mockResolvedValue({
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
    expect(agent.modules.signify.createIdentifier).not.toBeCalled(); // Just in case
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
    await identifierService.restoreIdentity(archivedMetadataRecord.id);
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
      identifierService.restoreIdentity(didMetadataRecord.id)
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
      identifierService.restoreIdentity(didMetadataRecord.id)
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
});
