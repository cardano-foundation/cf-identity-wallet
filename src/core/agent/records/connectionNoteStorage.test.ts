import { Query, StorageService } from "../../storage/storage.types";
import {
  ConnectionNoteRecord,
  ConnectionNoteRecordStorageProps,
} from "./connectionNoteRecord";
import { ConnectionNoteStorage } from "./connectionNoteStorage";

const storageService = jest.mocked<StorageService<ConnectionNoteRecord>>({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const connectionNoteStorage = new ConnectionNoteStorage(storageService);

const id1 = "id1";
const id2 = "id2";

const now = new Date();

const connectionNoteRecordProps: ConnectionNoteRecordStorageProps = {
  id: id1,
  createdAt: now,
  connectionId: "connectionId",
  title: "title",
  message: "message",
  tags: {},
};

const connectionNoteRecordA = new ConnectionNoteRecord(
  connectionNoteRecordProps
);

const connectionNoteRecordB = new ConnectionNoteRecord({
  ...connectionNoteRecordProps,
  id: id2,
});

describe("ConnectionNote Storage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should save connectionNote record", async () => {
    storageService.save.mockResolvedValue(connectionNoteRecordA);
    await connectionNoteStorage.save(connectionNoteRecordProps);
    expect(storageService.save).toBeCalledWith(connectionNoteRecordA);
  });

  test("Should delete connectionNote record", async () => {
    storageService.delete.mockResolvedValue();
    await connectionNoteStorage.delete(connectionNoteRecordA);
    expect(storageService.delete).toBeCalledWith(connectionNoteRecordA);
  });

  test("Should delete connectionNote record by ID", async () => {
    storageService.deleteById.mockResolvedValue();
    await connectionNoteStorage.deleteById(connectionNoteRecordA.id);
    expect(storageService.deleteById).toBeCalledWith(connectionNoteRecordA.id);
  });

  test("Should update connectionNote record", async () => {
    storageService.update.mockResolvedValue();
    await connectionNoteStorage.update(connectionNoteRecordA);
    expect(storageService.update).toBeCalledWith(connectionNoteRecordA);
  });

  test("Should find connectionNote record by ID", async () => {
    storageService.findById.mockResolvedValue(connectionNoteRecordA);
    const result = await connectionNoteStorage.findById(
      connectionNoteRecordA.id
    );
    expect(result).toEqual(connectionNoteRecordA);
  });

  test("Should find all connectionNote records by query", async () => {
    const query: Query<ConnectionNoteRecord> = {
      connectionId: "connectionId",
    };
    const records = [connectionNoteRecordA, connectionNoteRecordB];
    storageService.findAllByQuery.mockResolvedValue(records);
    const result = await connectionNoteStorage.findAllByQuery(query);
    expect(result).toEqual(records);
  });

  test("Should get all connectionNote records", async () => {
    const records = [connectionNoteRecordA, connectionNoteRecordB];
    storageService.getAll.mockResolvedValue(records);
    const result = await connectionNoteStorage.getAll();
    expect(result).toEqual(records);
  });

  // tests error
  test("Should handle saving error", async () => {
    storageService.save.mockRejectedValue(new Error("Saving error"));
    await expect(
      connectionNoteStorage.save(connectionNoteRecordProps)
    ).rejects.toThrow("Saving error");
  });

  test("Should handle deleting error", async () => {
    storageService.delete.mockRejectedValue(new Error("Deleting error"));
    await expect(
      connectionNoteStorage.delete(connectionNoteRecordA)
    ).rejects.toThrow("Deleting error");
  });

  test("Should handle updating error", async () => {
    storageService.update.mockRejectedValue(new Error("Updating error"));
    await expect(
      connectionNoteStorage.update(connectionNoteRecordA)
    ).rejects.toThrow("Updating error");
  });

  test("Should handle finding error", async () => {
    storageService.findById.mockRejectedValue(new Error("Finding error"));
    await expect(
      connectionNoteStorage.findById(connectionNoteRecordA.id)
    ).rejects.toThrow("Finding error");
  });

  test("Should handle not found", async () => {
    storageService.findById.mockResolvedValue(null);
    const result = await connectionNoteStorage.findById("nonexistentId");
    expect(result).toBeNull();
  });

  test("Should handle empty result", async () => {
    storageService.findAllByQuery.mockResolvedValue([]);
    const result = await connectionNoteStorage.findAllByQuery({ filter: {} });
    expect(result).toEqual([]);
  });

  test("Should handle empty result for getAll", async () => {
    storageService.getAll.mockResolvedValue([]);
    const result = await connectionNoteStorage.getAll();
    expect(result).toEqual([]);
  });
});
