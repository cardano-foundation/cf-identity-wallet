import {
  OperationPendingRecord,
  OperationPendingRecordStorageProps,
} from "./operationPendingRecord";
import { OperationPendingRecordType } from "./operationPendingRecord.type";

const mockData: OperationPendingRecordStorageProps = {
  id: "id",
  recordId: "1",
  recordType: OperationPendingRecordType.Witness,
};

describe("Operation pending  record", () => {
  test("should fill the record based on supplied props", () => {
    const createdAt = new Date();
    const settingsRecord = new OperationPendingRecord({
      ...mockData,
      createdAt: createdAt,
    });
    settingsRecord.getTags();
    expect(settingsRecord.id).toBe(mockData.id);
    expect(settingsRecord.createdAt).toBe(createdAt);
    expect(settingsRecord.recordId).toBe(mockData.recordId);
    expect(settingsRecord.recordType).toBe(mockData.recordType);
    expect(settingsRecord.getTags()).toMatchObject({
      recordId: mockData.recordId,
      recordType: mockData.recordType,
    });
  });

  test("should fallback to the current time if not supplied", async () => {
    const createdAt = new Date();
    await new Promise((resolve) => setTimeout(resolve, 10));
    const settingsRecord = new OperationPendingRecord({
      id: mockData.id,
      recordId: mockData.recordId,
      recordType: mockData.recordType,
    });
    expect(settingsRecord.createdAt.getTime()).toBeGreaterThan(
      createdAt.getTime()
    );
  });
});
