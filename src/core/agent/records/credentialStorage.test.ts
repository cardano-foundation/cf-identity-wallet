import { RecordType } from "../../storage/storage.types";
import { CredentialMetadataRecord } from "./credentialMetadataRecord";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "./credentialMetadataRecord.types";
import { CredentialStorage } from "./credentialStorage";

const storageService = jest.mocked({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const credentialStorage = new CredentialStorage(storageService as any);

const id1 = "id1";
const id2 = "id2";
const credentialRecordId1 = "cId1";

const now = new Date();
const nowISO = now.toISOString();

const credentialMetadataProps: CredentialMetadataRecordProps = {
  id: id1,
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

describe("Connection service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should get all credentials", async () => {
    storageService.findAllByQuery.mockResolvedValue([
      credentialMetadataRecordA,
      credentialMetadataRecordB,
    ]);
    expect(await credentialStorage.getAllCredentialMetadata()).toEqual([
      credentialMetadataRecordA,
      credentialMetadataRecordB,
    ]);
  });

  test("Should get credential metadata", async () => {
    storageService.findById.mockResolvedValue(credentialMetadataRecordA);
    expect(
      await credentialStorage.getCredentialMetadata(
        credentialMetadataRecordA.id
      )
    ).toEqual(credentialMetadataRecordA);
  });

  test("Should get credential metadata by credential record id", async () => {
    storageService.findAllByQuery.mockResolvedValue([
      credentialMetadataRecordA,
    ]);
    expect(
      await credentialStorage.getCredentialMetadataByCredentialRecordId(
        credentialMetadataRecordA.id
      )
    ).toEqual(credentialMetadataRecordA);
  });

  test("Should get credential metadata by connection record id", async () => {
    storageService.findAllByQuery.mockResolvedValue([
      credentialMetadataRecordB,
    ]);
    expect(
      await credentialStorage.getCredentialMetadataByCredentialRecordId(
        credentialMetadataRecordB.id
      )
    ).toEqual(credentialMetadataRecordB);
  });

  test("Should save credential metadata record", async () => {
    await credentialStorage.saveCredentialMetadataRecord(
      credentialMetadataProps
    );
    expect(storageService.save).toBeCalledWith(credentialMetadataRecordA);
  });

  test("Should update credential metadata record", async () => {
    storageService.findById.mockResolvedValue(credentialMetadataRecordA);
    await credentialStorage.updateCredentialMetadata(
      credentialMetadataRecordA.id,
      {
        credentialType: "credentialType",
      }
    );
    expect(storageService.update).toBeCalled();
  });

  test("Missing credential record should return null", async () => {
    storageService.findById.mockResolvedValue(null);
    const record = await credentialStorage.getCredentialMetadata("id");
    expect(record).toBe(null);
  });
});
