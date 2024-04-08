import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "./identifierMetadataRecord";

const mockData: IdentifierMetadataRecordProps = {
  id: "z6Mkpph7qyemfmHt5cSEXXbhm1VbSZT789X8Ep4eA7ndGxGh",
  displayName: "New AID",
  colors: ["#000000", "#FFFFFF"],
  isArchived: true,
  theme: 0,
};

describe("Identifier Record", () => {
  test("should fill the record based on supplied props", () => {
    const createdAt = new Date();
    const settingsRecord = new IdentifierMetadataRecord({
      ...mockData,
      createdAt: createdAt,
    });
    settingsRecord.getTags();
    expect(settingsRecord.type).toBe(IdentifierMetadataRecord.type);
    expect(settingsRecord.id).toBe(mockData.id);
    expect(settingsRecord.displayName).toBe(mockData.displayName);
    expect(settingsRecord.createdAt).toBe(createdAt);
    expect(settingsRecord.isArchived).toBe(mockData.isArchived);
    expect(settingsRecord.getTags()).toMatchObject({
      isArchived: mockData.isArchived,
    });
  });

  test("should fallback to the current time if not supplied", async () => {
    const createdAt = new Date();
    await new Promise((resolve) => setTimeout(resolve, 10));
    const settingsRecord = new IdentifierMetadataRecord({
      id: mockData.id,
      displayName: mockData.displayName,
      colors: mockData.colors,
      isArchived: mockData.isArchived,
      theme: 0,
    });
    expect(settingsRecord.createdAt.getTime()).toBeGreaterThan(
      createdAt.getTime()
    );
  });

  test("should isArchived = false if not supplied", async () => {
    const createdAt = new Date();
    const settingsRecord = new IdentifierMetadataRecord({
      id: mockData.id,
      displayName: mockData.displayName,
      colors: mockData.colors,
      createdAt: createdAt,
      theme: 0,
    });
    expect(settingsRecord.isArchived).toBe(false);
  });
});
