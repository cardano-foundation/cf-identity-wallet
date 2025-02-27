import { Query, StorageService } from "../../storage/storage.types";
import {
  OperationPendingRecord,
  OperationPendingRecordStorageProps,
} from "./operationPendingRecord";
import { OperationPendingStorage } from "./operationPendingStorage";
import { OperationPendingRecordType } from "./operationPendingRecord.type";
import { CoreEventEmitter } from "../event";
import { EventTypes } from "../event.types";

const storageService = jest.mocked<StorageService<OperationPendingRecord>>({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const eventEmitter = new CoreEventEmitter();
const operationPendingStorage = new OperationPendingStorage(
  storageService,
  eventEmitter
);

const id1 = "id1";
const id2 = "id2";

const now = new Date();

const operationPendingRecordStorageProps: OperationPendingRecordStorageProps = {
  id: id1,
  createdAt: now,
  recordType: OperationPendingRecordType.Witness,
  tags: {},
};

const operationPendingRecordA = new OperationPendingRecord(
  operationPendingRecordStorageProps
);

const operationPendingRecordB = new OperationPendingRecord({
  ...operationPendingRecordStorageProps,
  id: id2,
});

describe("Operation Pending Storage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest
      .spyOn(global, "Date")
      .mockImplementation(() => now as unknown as string);
  });

  test("Should save operation pending record", async () => {
    storageService.save.mockResolvedValue(operationPendingRecordA);
    eventEmitter.emit = jest.fn();
    await operationPendingStorage.save(operationPendingRecordStorageProps);
    expect(storageService.save).toBeCalledWith(operationPendingRecordA);
    expect(eventEmitter.emit).toBeCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: operationPendingRecordA.id,
          recordType: operationPendingRecordA.recordType,
          createdAt: now,
          updatedAt: undefined,
          _tags: {},
          type: "OperationPendingRecord",
        },
      },
    });
  });

  test("Should delete operation pending record", async () => {
    storageService.delete.mockResolvedValue();
    await operationPendingStorage.delete(operationPendingRecordA);
    expect(storageService.delete).toBeCalledWith(operationPendingRecordA);
  });

  test("Should delete operation pending record by ID", async () => {
    storageService.deleteById.mockResolvedValue();
    await operationPendingStorage.deleteById(operationPendingRecordA.id);
    expect(storageService.deleteById).toBeCalledWith(
      operationPendingRecordA.id
    );
  });

  test("Should update operation pending record", async () => {
    storageService.update.mockResolvedValue();
    await operationPendingStorage.update(operationPendingRecordA);
    expect(storageService.update).toBeCalledWith(operationPendingRecordA);
  });

  test("Should find operation pending record by ID", async () => {
    storageService.findById.mockResolvedValue(operationPendingRecordA);
    const result = await operationPendingStorage.findById(
      operationPendingRecordA.id
    );
    expect(result).toEqual(operationPendingRecordA);
  });

  test("Should find all operation pending records by query", async () => {
    const query: Query<OperationPendingRecord> = {
      recordId: "1",
    };
    const records = [operationPendingRecordA, operationPendingRecordB];
    storageService.findAllByQuery.mockResolvedValue(records);
    const result = await operationPendingStorage.findAllByQuery(query);
    expect(result).toEqual(records);
  });

  test("Should get all operation pending records", async () => {
    const records = [operationPendingRecordA, operationPendingRecordB];
    storageService.getAll.mockResolvedValue(records);
    const result = await operationPendingStorage.getAll();
    expect(result).toEqual(records);
  });

  // tests error
  test("Should handle saving error", async () => {
    storageService.save.mockRejectedValue(new Error("Saving error"));
    await expect(
      operationPendingStorage.save(operationPendingRecordStorageProps)
    ).rejects.toThrow("Saving error");
  });

  test("Should handle deleting error", async () => {
    storageService.delete.mockRejectedValue(new Error("Deleting error"));
    await expect(
      operationPendingStorage.delete(operationPendingRecordA)
    ).rejects.toThrow("Deleting error");
  });

  test("Should handle updating error", async () => {
    storageService.update.mockRejectedValue(new Error("Updating error"));
    await expect(
      operationPendingStorage.update(operationPendingRecordA)
    ).rejects.toThrow("Updating error");
  });

  test("Should handle finding error", async () => {
    storageService.findById.mockRejectedValue(new Error("Finding error"));
    await expect(
      operationPendingStorage.findById(operationPendingRecordA.id)
    ).rejects.toThrow("Finding error");
  });

  test("Should handle not found", async () => {
    storageService.findById.mockResolvedValue(null);
    const result = await operationPendingStorage.findById("nonexistentId");
    expect(result).toBeNull();
  });

  test("Should handle empty result", async () => {
    storageService.findAllByQuery.mockResolvedValue([]);
    const result = await operationPendingStorage.findAllByQuery({ filter: {} });
    expect(result).toEqual([]);
  });

  test("Should handle empty result for getAll", async () => {
    storageService.getAll.mockResolvedValue([]);
    const result = await operationPendingStorage.getAll();
    expect(result).toEqual([]);
  });

  test("Should not raise an error when adding two records with the same ID", async () => {
    await operationPendingStorage.save(operationPendingRecordStorageProps);
    await expect(
      operationPendingStorage.save(operationPendingRecordStorageProps)
    ).resolves.not.toThrow();

    expect(storageService.save).toBeCalledTimes(2);
  });
});
