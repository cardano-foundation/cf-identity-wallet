import { memberIdentifierRecord } from "../../__fixtures__/agent/multiSigFixtures";
import { CredentialStatus } from "../services/credentialService.types";
import { IdentifierType } from "../services/identifier.types";
import { CredentialMetadataRecord } from "./credentialMetadataRecord";
import { CredentialMetadataRecordProps } from "./credentialMetadataRecord.types";

const mockData: CredentialMetadataRecordProps = {
  id: "credential:z6Mkpph7qyemfmHt5cSEXXbhm1VbSZT789X8Ep4eA7ndGxGh",
  isArchived: true,
  issuanceDate: "2010-01-01T19:23:24Z",
  credentialType: "test",
  status: CredentialStatus.CONFIRMED,
  connectionId: "EEnw0sGaicPN-9gHgU62JIZOYo7cMzXjd-fpwJ1EgdK6",
  schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  identifierType: IdentifierType.Individual,
  identifierId: memberIdentifierRecord.id,
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
    expect(settingsRecord.getTags()).toMatchObject({
      isArchived: mockData.isArchived,
    });
  });

  test("should fallback to the current time if not supplied", async () => {
    const createdAt = new Date();
    await new Promise((resolve) => setTimeout(resolve, 10));
    const settingsRecord = new CredentialMetadataRecord({
      id: mockData.id,
      isArchived: mockData.isArchived,
      issuanceDate: "2010-01-01T19:23:24Z",
      credentialType: "test",
      status: CredentialStatus.CONFIRMED,
      connectionId: "EEnw0sGaicPN-9gHgU62JIZOYo7cMzXjd-fpwJ1EgdK6",
      schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
      identifierId: memberIdentifierRecord.id,
      identifierType: IdentifierType.Individual,
    });
    expect(settingsRecord.createdAt.getTime()).toBeGreaterThan(
      createdAt.getTime()
    );
  });

  test("should isArchived = false if not supplied", async () => {
    const createdAt = new Date();
    const settingsRecord = new CredentialMetadataRecord({
      id: mockData.id,
      createdAt: createdAt,
      issuanceDate: "2010-01-01T19:23:24Z",
      credentialType: "test",
      status: CredentialStatus.CONFIRMED,
      connectionId: "EEnw0sGaicPN-9gHgU62JIZOYo7cMzXjd-fpwJ1EgdK6",
      schema: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
      identifierId: memberIdentifierRecord.id,
      identifierType: IdentifierType.Individual,
    });
    expect(settingsRecord.isArchived).toBe(false);
  });
});
