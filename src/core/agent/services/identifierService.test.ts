import { Agent, DidDocumentRole, DidRecord } from "@aries-framework/core";
import { IdentifierService } from "./identifierService";
import { IdentifierMetadataRecord } from "../modules/generalStorage/repositories/identifierMetadataRecord";
import { IdentifierType } from "../agent.types";

// We are losing typing here but the Agent class is overly complex to setup for tests.
const agent = jest.mocked({
  modules: {
    generalStorage: {
      getAllAvailableIdentifierMetadata: jest.fn(),
      getAllArchivedIdentifierMetadata: jest.fn(),
      getIdentifierMetadata: jest.fn(),
    },
    signify: {
      getIdentifierByName: jest.fn(),
    },
  },
  dids: {
    getCreatedDids: jest.fn(),
    resolve: jest.fn(),
  },
});
const identifierService = new IdentifierService(agent as any as Agent);

const now = new Date();
const nowISO = now.toISOString();
const colors: [string, string] = ["#fff", "#fff"];
const did = "did:key:xyz";
const keyType = "ed25519";
const pkey = "pkey";
const aid = "aidHere";
const signifyName = "uuid-here";

const didMetadataRecordProps = {
  id: did,
  displayName: "Identifier 1",
  colors,
  method: IdentifierType.KEY,
  createdAt: now,
};
const didMetadataRecord = new IdentifierMetadataRecord(didMetadataRecordProps);

const keriMetadataRecordProps = {
  id: aid,
  displayName: "Identifier 2",
  colors,
  method: IdentifierType.KERI,
  signifyName,
  createdAt: now,
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
      },
      {
        id: aid,
        displayName: "Identifier 2",
        colors,
        method: IdentifierType.KERI,
        createdAtUTC: nowISO,
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
      },
      {
        id: aid,
        displayName: "Identifier 2",
        colors,
        method: IdentifierType.KERI,
        createdAtUTC: nowISO,
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
        keyType,
        publicKeyBase58: pkey,
        createdAtUTC: nowISO,
        method: IdentifierType.KEY,
      },
    });
  });

  test("search for non existant keri aid (in db)", async () => {
    await expect(identifierService.getIdentifier(aid)).rejects.toThrowError(
      IdentifierService.IDENTIFIER_METADATA_RECORD_MISSING
    );
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      aid
    );
  });

  test("identifier exists in the database but not on Signify", async () => {
    agent.modules.generalStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    expect(await identifierService.getIdentifier(aid)).toBe(undefined);
    expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(
      aid
    );
    expect(agent.modules.signify.getIdentifierByName).toBeCalledWith(
      signifyName
    );
  });

  // TODO this has changed so finish after rebase on develop
  // test("can get existant keri aid", async () => {
  //   agent.modules.generalStorage.getIdentifierMetadata = jest.fn().mockResolvedValue(keriMetadataRecord);
  //   agent.modules.signify.getIdentifierByName = jest.fn().mockReturnValue({
  //     state: {
  //       s: "",
  //       p: "",
  //       d: "",
  //       dt: "",
  //       et: "",
  //       kt: "",
  //       k: ""
  //     }
  //     sequenceNumber: aid.state.s,
  //     priorEventSaid: aid.state.p,
  //     eventSaid: aid.state.d,
  //     eventTimestamp: aid.state.dt,
  //     eventType: aid.state.et,
  //     keySigningThreshold: aid.state.kt,
  //     signingKeys: aid.state.k,
  //     nextKeysThreshold: aid.state.nt,
  //     nextKeys: aid.state.n,
  //     backerThreshold: aid.state.bt,
  //     backerAids: aid.state.b,
  //     lastEstablishmentEvent: {
  //       said: aid.state.ee.d,
  //       sequence: aid.state.ee.s,
  //       backerToAdd: aid.state.ee.ba,
  //       backerToRemove: aid.state.ee.br,
  //     },
  //   });
  //   const result = await identifierService.getIdentifier(aid);
  //   expect(agent.modules.generalStorage.getIdentifierMetadata).toBeCalledWith(aid);
  //   expect(agent.modules.signify.getIdentifierByName).toBeCalledWith(signifyName);
  //   expect(result).toStrictEqual({
  //     type: IdentifierType.KERI,
  //     result: {
  //       id: aid,
  //       method: IdentifierType.KERI,  // @TODO - foconnor: duplicate info again
  //       displayName: keriMetadataRecordProps.displayName,
  //       createdAtUTC: nowISO,
  //       colors: keriMetadataRecordProps.colors,

  //     }
  //   });
  // });
});
