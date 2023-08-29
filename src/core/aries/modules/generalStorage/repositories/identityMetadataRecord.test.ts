import {IdentityMetadataRecord, IdentityMetadataRecordProps} from "./identityMetadataRecord";

const mockData:IdentityMetadataRecordProps = {
  id: "did:key:z6Mkpph7qyemfmHt5cSEXXbhm1VbSZT789X8Ep4eA7ndGxGh",
  displayName: "New Did",
  colors: ["#000000", "#FFFFFF"],
  isDelete: true
}

describe("Identify Record", () => {
  test("should fill the record based on supplied props", () => {
    const createdAt = new Date();
    const settingsRecord = new IdentityMetadataRecord({...mockData, createdAt: createdAt});
    settingsRecord.getTags();
    expect(settingsRecord.type).toBe(IdentityMetadataRecord.type);
    expect(settingsRecord.id).toBe(mockData.id);
    expect(settingsRecord.displayName).toBe(mockData.displayName);
    expect(settingsRecord.createdAt).toBe(createdAt);
    expect(settingsRecord.isDelete).toBe(mockData.isDelete);
    expect(settingsRecord.getTags()).toMatchObject({});
  });

  test("should fallback to the current time if not supplied", async () => {
    const createdAt = new Date();
    await new Promise((resolve) => setTimeout(resolve, 10));
    const settingsRecord = new IdentityMetadataRecord({
      id: mockData.id,
      displayName: mockData.displayName,
      colors: mockData.colors,
      isDelete: mockData.isDelete,
    });
    expect(settingsRecord.createdAt.getTime()).toBeGreaterThan(
      createdAt.getTime()
    );
  });
  
  test("should isDelete = false if not supplied", async () => {
    const createdAt = new Date();
    const settingsRecord = new IdentityMetadataRecord({
      id: mockData.id,
      displayName: mockData.displayName,
      colors: mockData.colors,
      createdAt: createdAt,
    });
    expect(settingsRecord.isDelete).toBe(false);
  });
});
