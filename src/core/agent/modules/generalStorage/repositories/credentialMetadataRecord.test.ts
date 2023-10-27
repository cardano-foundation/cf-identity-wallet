import { CredentialMetadataRecord } from "./credentialMetadataRecord";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "./credentialMetadataRecord.types";

const mockData: CredentialMetadataRecordProps = {
  id: "credential:z6Mkpph7qyemfmHt5cSEXXbhm1VbSZT789X8Ep4eA7ndGxGh",
  colors: ["#000000", "#FFFFFF"],
  isArchived: true,
  issuanceDate: "2010-01-01T19:23:24Z",
  issuerLogo: "https://placehold.co/120x22",
  credentialType: "test",
  status: CredentialMetadataRecordStatus.CONFIRMED,
  credentialRecordId: "1",
  credentialSubject: {},
};

describe("Credential metadata record", () => {
  test("should fill the record based on supplied props", () => {
    const createdAt = new Date();
    const settingsRecord = new CredentialMetadataRecord({
      ...mockData,
      createdAt: createdAt,
    });
    settingsRecord.getTags();
    expect(settingsRecord.id).toBe(mockData.id);
    expect(settingsRecord.createdAt).toBe(createdAt);
    expect(settingsRecord.isArchived).toBe(mockData.isArchived);
    expect(settingsRecord.issuanceDate).toBe(mockData.issuanceDate);
    expect(settingsRecord.issuerLogo).toBe(mockData.issuerLogo);
    expect(settingsRecord.getTags()).toMatchObject({
      isArchived: mockData.isArchived,
    });
  });

  test("should fallback to the current time if not supplied", async () => {
    const createdAt = new Date();
    await new Promise((resolve) => setTimeout(resolve, 10));
    const settingsRecord = new CredentialMetadataRecord({
      id: mockData.id,
      colors: mockData.colors,
      isArchived: mockData.isArchived,
      issuanceDate: "2010-01-01T19:23:24Z",
      issuerLogo: "https://placehold.co/120x22",
      credentialType: "test",
      status: CredentialMetadataRecordStatus.CONFIRMED,
      credentialRecordId: "1",
      credentialSubject: {},
    });
    expect(settingsRecord.createdAt.getTime()).toBeGreaterThan(
      createdAt.getTime()
    );
  });

  test("should isArchived = false if not supplied", async () => {
    const createdAt = new Date();
    const settingsRecord = new CredentialMetadataRecord({
      id: mockData.id,
      colors: mockData.colors,
      createdAt: createdAt,
      issuanceDate: "2010-01-01T19:23:24Z",
      issuerLogo: "https://placehold.co/120x22",
      credentialType: "test",
      status: CredentialMetadataRecordStatus.CONFIRMED,
      credentialRecordId: "1",
      credentialSubject: {},
    });
    expect(settingsRecord.isArchived).toBe(false);
  });
});
