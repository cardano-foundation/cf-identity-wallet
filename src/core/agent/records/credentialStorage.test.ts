import { memberIdentifierRecord } from "../../__fixtures__/agent/multiSigFixtures";
import { CredentialStatus } from "../services/credentialService.types";
import { IdentifierType } from "../services/identifier.types";
import { CredentialMetadataRecord } from "./credentialMetadataRecord";
import { CredentialMetadataRecordProps } from "./credentialMetadataRecord.types";
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

const now = new Date();
const nowISO = now.toISOString();

const credentialMetadataProps: CredentialMetadataRecordProps = {
  id: id1,
  createdAt: now,
  issuanceDate: nowISO,
  credentialType: "credType",
  status: CredentialStatus.CONFIRMED,
  connectionId: "EEnw0sGaicPN-9gHgU62JIZOYo7cMzXjd-fpwJ1EgdK6",
  schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  identifierId: memberIdentifierRecord.id,
  identifierType: IdentifierType.Individual,
};

const credentialMetadataRecordA = new CredentialMetadataRecord(
  credentialMetadataProps
);

const credentialMetadataRecordB = new CredentialMetadataRecord({
  ...credentialMetadataProps,
  id: id2,
});

describe("Credential storage test", () => {
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

  test("Should get credential by ids", async () => {
    const ids = [credentialMetadataRecordA.id, credentialMetadataRecordB.id];
    storageService.findAllByQuery.mockResolvedValue([
      credentialMetadataRecordA,
      credentialMetadataRecordB,
    ]);
    expect(await credentialStorage.getCredentialMetadatasById(ids)).toEqual([
      credentialMetadataRecordA,
      credentialMetadataRecordB,
    ]);
    expect(storageService.findAllByQuery).toBeCalledWith(
      {
        $or: ids.map((id) => ({ id })),
      },
      CredentialMetadataRecord
    );
  });

  test("can get credentials pending deletion", async () => {
    storageService.findAllByQuery.mockResolvedValue([
      credentialMetadataRecordA,
      credentialMetadataRecordB,
    ]);
    expect(await credentialStorage.getCredentialsPendingDeletion()).toEqual([
      credentialMetadataRecordA,
      credentialMetadataRecordB,
    ]);
    expect(storageService.findAllByQuery).toBeCalledWith(
      {
        pendingDeletion: true,
      },
      CredentialMetadataRecord
    );
  });

  test("Fetching credentials by empty ID array should skip the DB call", async () => {
    expect(await credentialStorage.getCredentialMetadatasById([])).toEqual([]);
    expect(storageService.findAllByQuery).not.toBeCalled();
  });
});
