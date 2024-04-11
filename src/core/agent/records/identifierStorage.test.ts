import { RecordType } from "../../storage/storage.types";
import { BasicRecord } from "./basicRecord";
import { IdentifierMetadataRecord } from "./identifierMetadataRecord";
import { IdentifierStorage } from "./identifierStorage";

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

const identifierStorage = new IdentifierStorage(basicStorage);

const now = new Date();
const colors: [string, string] = ["#fff", "#fff"];

const identifierMetadataRecordProps = {
  id: "aidHere",
  displayName: "Identifier 2",
  colors,
  signifyName: "uuid-here",
  createdAt: now,
  theme: 0,
};
const identifierMetadataRecord = new IdentifierMetadataRecord({
  ...identifierMetadataRecordProps,
});

const identifierMetadataRecord2 = new IdentifierMetadataRecord({
  ...identifierMetadataRecordProps,
  id: "id2",
});

const basicRecordA = new BasicRecord({
  id: identifierMetadataRecord.id,
  content: identifierMetadataRecord.toJSON(),
  tags: identifierMetadataRecord.getTags(),
  type: RecordType.IDENTIFIER_METADATA_RECORD,
});

const basicRecordB = new BasicRecord({
  id: identifierMetadataRecord2.id,
  content: identifierMetadataRecord2.toJSON(),
  tags: identifierMetadataRecord2.getTags(),
  type: RecordType.IDENTIFIER_METADATA_RECORD,
});

describe("Connection service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should get all credentials", async () => {
    basicStorage.findAllByQuery.mockResolvedValue([basicRecordA, basicRecordB]);
    expect(await identifierStorage.getAllIdentifierMetadata(false)).toEqual([
      {
        ...identifierMetadataRecord,
        _tags: identifierMetadataRecord.getTags(),
        updatedAt: undefined,
      },
      {
        ...identifierMetadataRecord2,
        _tags: identifierMetadataRecord2.getTags(),
        updatedAt: undefined,
      },
    ]);
  });

  test("Should get credential metadata", async () => {
    basicStorage.findById.mockResolvedValue(basicRecordA);
    expect(
      await identifierStorage.getIdentifierMetadata(identifierMetadataRecord.id)
    ).toEqual({
      ...identifierMetadataRecord,
      _tags: identifierMetadataRecord.getTags(),
      updatedAt: undefined,
    });
  });

  test("Should get credential metadata and throw error if null", async () => {
    basicStorage.findById.mockResolvedValue(null);
    await expect(
      identifierStorage.getIdentifierMetadata(identifierMetadataRecord.id)
    ).rejects.toThrowError(
      IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING
    );
  });

  test("Should get keri identifiers metadata", async () => {
    basicStorage.getAll.mockResolvedValue([basicRecordA]);
    expect(await identifierStorage.getKeriIdentifiersMetadata()).toEqual([
      {
        ...identifierMetadataRecord,
        _tags: identifierMetadataRecord.getTags(),
        updatedAt: undefined,
      },
    ]);
  });

  test("Should save identifier metadata record", async () => {
    await identifierStorage.createIdentifierMetadataRecord(
      identifierMetadataRecordProps
    );
    expect(basicStorage.save).toBeCalledWith({
      id: identifierMetadataRecord.id,
      content: identifierMetadataRecord.toJSON(),
      tags: {
        ...identifierMetadataRecord.getTags(),
      },
      type: RecordType.IDENTIFIER_METADATA_RECORD,
    });
  });

  test("Should update credential metadata record", async () => {
    basicStorage.findById.mockResolvedValue(basicRecordA);
    await identifierStorage.updateIdentifierMetadata(
      identifierMetadataRecord.id,
      {
        displayName: "displayName",
      }
    );
    expect(basicStorage.update).toBeCalled();
  });
});
