import { MiscRecord } from "./miscRecord";

const recordId = "EXAMPLE_RECORD";
const recordValue = "misc-item-value";

describe("Misc Record", () => {
  test("should fill the record based on supplied props", () => {
    const createdAt = new Date();
    const settingsRecord = new MiscRecord({
      id: recordId,
      value: recordValue,
      createdAt: createdAt,
    });

    expect(settingsRecord.type).toBe(MiscRecord.type);
    expect(settingsRecord.id).toBe(recordId);
    expect(settingsRecord.value).toBe(recordValue);
    expect(settingsRecord.createdAt).toBe(createdAt);
    expect(settingsRecord.getTags()).toMatchObject({});
  });

  test("should fallback to the current time if not supplied", async () => {
    const createdAt = new Date();
    await new Promise((resolve) => setTimeout(resolve, 10));
    const settingsRecord = new MiscRecord({
      id: recordId,
      value: recordValue,
    });
    expect(settingsRecord.createdAt.getTime()).toBeGreaterThan(
      createdAt.getTime()
    );
  });
});
