import { RecordType } from "../../storage/storage.types";
import { BasicRecord } from "./basicRecord";
import { CredentialMetadataRecord } from "./credentialMetadataRecord";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "./credentialMetadataRecord.types";
import { CredentialStorage } from "./credentialStorage";

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

const credentialStorage = new CredentialStorage(basicStorage);

const id1 = "id1";
const id2 = "id2";
const credentialRecordId1 = "cId1";

const now = new Date();
const nowISO = now.toISOString();
const colors: [string, string] = ["#fff", "#fff"];

const credentialMetadataProps: CredentialMetadataRecordProps = {
  id: id1,
  colors,
  createdAt: now,
  issuanceDate: nowISO,
  issuerLogo: "issuerLogoHere",
  credentialType: "credType",
  status: CredentialMetadataRecordStatus.CONFIRMED,
  credentialRecordId: credentialRecordId1,
};

const credentialMetadataRecordA = new CredentialMetadataRecord(
  credentialMetadataProps
);

const credentialMetadataRecordB = new CredentialMetadataRecord({
  ...credentialMetadataProps,
  id: id2,
});

const basicRecordA = new BasicRecord({
  id: credentialMetadataRecordA.id,
  content: credentialMetadataRecordA.toJSON(),
  tags: credentialMetadataRecordA.getTags(),
  type: RecordType.CREDENTIAL_METADATA_RECORD,
});

const basicRecordB = new BasicRecord({
  id: credentialMetadataRecordB.id,
  content: credentialMetadataRecordB.toJSON(),
  tags: credentialMetadataRecordB.getTags(),
  type: RecordType.CREDENTIAL_METADATA_RECORD,
});

describe("Connection service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should get all credentials", async () => {
    basicStorage.findAllByQuery.mockResolvedValue([basicRecordA, basicRecordB]);
    expect(await credentialStorage.getAllCredentialMetadata()).toEqual([
      {
        ...credentialMetadataRecordA,
        _tags: credentialMetadataRecordA.getTags(),
        updatedAt: undefined,
      },
      {
        ...credentialMetadataRecordB,
        _tags: credentialMetadataRecordB.getTags(),
        updatedAt: undefined,
      },
    ]);
  });

  test("Should get credential metadata", async () => {
    basicStorage.findById.mockResolvedValue(basicRecordA);
    expect(
      await credentialStorage.getCredentialMetadata(
        credentialMetadataRecordA.id
      )
    ).toEqual({
      ...credentialMetadataRecordA,
      _tags: credentialMetadataRecordA.getTags(),
      updatedAt: undefined,
    });
  });

  test("Should get credential metadata by credential record id", async () => {
    basicStorage.findAllByQuery.mockResolvedValue([basicRecordA]);
    expect(
      await credentialStorage.getCredentialMetadataByCredentialRecordId(
        credentialMetadataRecordA.id
      )
    ).toEqual({
      ...credentialMetadataRecordA,
      _tags: credentialMetadataRecordA.getTags(),
      updatedAt: undefined,
    });
  });

  test("Should get credential metadata by connection record id", async () => {
    basicStorage.findAllByQuery.mockResolvedValue([basicRecordB]);
    expect(
      await credentialStorage.getCredentialMetadataByCredentialRecordId(
        credentialMetadataRecordB.id
      )
    ).toEqual({
      ...credentialMetadataRecordB,
      _tags: credentialMetadataRecordB.getTags(),
      updatedAt: undefined,
    });
  });

  test("Should save credential metadata record", async () => {
    await credentialStorage.saveCredentialMetadataRecord(
      credentialMetadataRecordA
    );
    expect(basicStorage.save).toBeCalledWith({
      id: credentialMetadataRecordA.id,
      content: credentialMetadataRecordA.toJSON(),
      tags: {
        ...credentialMetadataRecordA.getTags(),
      },
      type: RecordType.CREDENTIAL_METADATA_RECORD,
    });
  });

  test("Should update credential metadata record", async () => {
    basicStorage.findById.mockResolvedValue(basicRecordA);
    await credentialStorage.updateCredentialMetadata(
      credentialMetadataRecordA.id,
      {
        credentialType: "credentialType",
      }
    );
    expect(basicStorage.update).toBeCalled();
  });
});
