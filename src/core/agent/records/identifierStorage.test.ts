import { RecordType } from "../../storage/storage.types";
import { BasicRecord } from "./basicRecord";
import { IdentifierMetadataRecord } from "./identifierMetadataRecord";
import { IdentifierStorage } from "./identifierStorage";

const storageService = jest.mocked({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const identifierStorage = new IdentifierStorage(storageService as any);

const now = new Date();

const identifierMetadataRecordProps = {
  id: "aidHere",
  displayName: "Identifier 2",
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
describe("Connection service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should get all credentials", async () => {
    storageService.findAllByQuery.mockResolvedValue([
      identifierMetadataRecord,
      identifierMetadataRecord2,
    ]);
    expect(await identifierStorage.getAllIdentifierMetadata(false)).toEqual([
      identifierMetadataRecord,
      identifierMetadataRecord2,
    ]);
  });

  test("Should get credential metadata", async () => {
    storageService.findById.mockResolvedValue(identifierMetadataRecord);
    expect(
      await identifierStorage.getIdentifierMetadata(identifierMetadataRecord.id)
    ).toEqual(identifierMetadataRecord);
  });

  test("Should throw if identifier metadata record is missing", async () => {
    storageService.findById.mockResolvedValue(null);
    await expect(
      identifierStorage.getIdentifierMetadata(identifierMetadataRecord.id)
    ).rejects.toThrowError(
      IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING
    );
  });

  test("Should get keri identifiers metadata", async () => {
    storageService.getAll.mockResolvedValue([identifierMetadataRecord]);
    expect(await identifierStorage.getKeriIdentifiersMetadata()).toEqual([
      identifierMetadataRecord,
    ]);
  });

  test("Should save identifier metadata record", async () => {
    await identifierStorage.createIdentifierMetadataRecord(
      identifierMetadataRecordProps
    );
    expect(storageService.save).toBeCalledWith(identifierMetadataRecord);
  });

  test("Should update credential metadata record", async () => {
    storageService.findById.mockResolvedValue(identifierMetadataRecord);
    await identifierStorage.updateIdentifierMetadata(
      identifierMetadataRecord.id,
      {
        displayName: "displayName",
      }
    );
    expect(storageService.update).toBeCalled();
  });
});
