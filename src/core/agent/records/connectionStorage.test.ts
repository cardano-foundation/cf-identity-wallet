import { Query, StorageService } from "../../storage/storage.types";
import { CreationStatus } from "../agent.types";
import {
  ConnectionRecord,
  ConnectionRecordStorageProps,
} from "./connectionRecord";
import { ConnectionStorage } from "./connectionStorage";

const storageService = jest.mocked<StorageService<ConnectionRecord>>({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const connectionStorage = new ConnectionStorage(storageService);

const id1 = "id1";
const id2 = "id2";

const now = new Date();

const connectionRecordProps: ConnectionRecordStorageProps = {
  id: id1,
  createdAt: now,
  alias: "alias",
  oobi: "oobi",
  tags: {},
  creationStatus: CreationStatus.COMPLETE,
};

const connectionRecordA = new ConnectionRecord(connectionRecordProps);

const connectionRecordB = new ConnectionRecord({
  ...connectionRecordProps,
  id: id2,
});

describe("Connection Storage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should save connection record", async () => {
    storageService.save.mockResolvedValue(connectionRecordA);
    await connectionStorage.save(connectionRecordProps);
    expect(storageService.save).toBeCalledWith(connectionRecordA);
  });

  test("Should delete connection record", async () => {
    storageService.delete.mockResolvedValue();
    await connectionStorage.delete(connectionRecordA);
    expect(storageService.delete).toBeCalledWith(connectionRecordA);
  });

  test("Should delete connection record by ID", async () => {
    storageService.deleteById.mockResolvedValue();
    await connectionStorage.deleteById(connectionRecordA.id);
    expect(storageService.deleteById).toBeCalledWith(connectionRecordA.id);
  });

  test("Should update connection record", async () => {
    storageService.update.mockResolvedValue();
    await connectionStorage.update(connectionRecordA);
    expect(storageService.update).toBeCalledWith(connectionRecordA);
  });

  test("Should find connection record by ID", async () => {
    storageService.findById.mockResolvedValue(connectionRecordA);
    const result = await connectionStorage.findById(connectionRecordA.id);
    expect(result).toEqual(connectionRecordA);
  });

  test("Should find all connection records by query", async () => {
    const query: Query<ConnectionRecord> = {
      alias: "alias",
    };
    const records = [connectionRecordA, connectionRecordB];
    storageService.findAllByQuery.mockResolvedValue(records);
    const result = await connectionStorage.findAllByQuery(query);
    expect(result).toEqual(records);
  });

  test("Should get all connection records", async () => {
    const records = [connectionRecordA, connectionRecordB];
    storageService.getAll.mockResolvedValue(records);
    const result = await connectionStorage.getAll();
    expect(result).toEqual(records);
  });

  // tests error
  test("Should handle saving error", async () => {
    storageService.save.mockRejectedValue(new Error("Saving error"));
    await expect(connectionStorage.save(connectionRecordProps)).rejects.toThrow(
      "Saving error"
    );
  });

  test("Should handle deleting error", async () => {
    storageService.delete.mockRejectedValue(new Error("Deleting error"));
    await expect(connectionStorage.delete(connectionRecordA)).rejects.toThrow(
      "Deleting error"
    );
  });

  test("Should handle updating error", async () => {
    storageService.update.mockRejectedValue(new Error("Updating error"));
    await expect(connectionStorage.update(connectionRecordA)).rejects.toThrow(
      "Updating error"
    );
  });

  test("Should handle finding error", async () => {
    storageService.findById.mockRejectedValue(new Error("Finding error"));
    await expect(
      connectionStorage.findById(connectionRecordA.id)
    ).rejects.toThrow("Finding error");
  });

  test("Should handle not found", async () => {
    storageService.findById.mockResolvedValue(null);
    const result = await connectionStorage.findById("nonexistentId");
    expect(result).toBeNull();
  });

  test("Should handle empty result", async () => {
    storageService.findAllByQuery.mockResolvedValue([]);
    const result = await connectionStorage.findAllByQuery({ filter: {} });
    expect(result).toEqual([]);
  });

  test("Should handle empty result for getAll", async () => {
    storageService.getAll.mockResolvedValue([]);
    const result = await connectionStorage.getAll();
    expect(result).toEqual([]);
  });
});
