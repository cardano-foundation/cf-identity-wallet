import { Query, StorageService } from "../../storage/storage.types";
import { BasicRecord } from "./basicRecord";
import { BasicStorage } from "./basicStorage";

const storageService = jest.mocked<StorageService<BasicRecord>>({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const basicStorage = new BasicStorage(storageService);

const id1 = "id1";
const id2 = "id2";

const fixedDate = new Date(1609459200000);

const basicRecordProps = {
  id: id1,
  tags: {},
  content: { data: "content" },
  createdAt: fixedDate,
};

const basicRecordA = new BasicRecord(basicRecordProps);

const basicRecordB = new BasicRecord({
  ...basicRecordProps,
  id: id2,
  content: { data: "content" },
});

describe("Basic Storage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(global, "Date").mockImplementation(() => fixedDate as unknown as string);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("Should save basic record", async () => {
    storageService.save.mockResolvedValue(basicRecordA);
    await basicStorage.save(basicRecordProps);
    expect(storageService.save).toBeCalledWith(basicRecordA);
  });

  test("Should delete basic record", async () => {
    storageService.delete.mockResolvedValue();
    await basicStorage.delete(basicRecordA);
    expect(storageService.delete).toBeCalledWith(basicRecordA);
  });

  test("Should delete basic record by ID", async () => {
    storageService.deleteById.mockResolvedValue();
    await basicStorage.deleteById(basicRecordA.id);
    expect(storageService.deleteById).toBeCalledWith(basicRecordA.id);
  });

  test("Should update basic record", async () => {
    storageService.update.mockResolvedValue();
    await basicStorage.update(basicRecordA);
    expect(storageService.update).toBeCalledWith(basicRecordA);
  });

  test("Should find basic record by ID", async () => {
    storageService.findById.mockResolvedValue(basicRecordA);
    const result = await basicStorage.findById(basicRecordA.id);
    expect(result).toEqual(basicRecordA);
  });

  test("Should find all basic records by query", async () => {
    const query: Query<BasicRecord> = {
      filter: {
        content: "content",
      },
      sort: {
        createdAt: "desc",
      },
      limit: 10,
    };
    const records = [basicRecordA, basicRecordB];
    storageService.findAllByQuery.mockResolvedValue(records);
    const result = await basicStorage.findAllByQuery(query);
    expect(result).toEqual(records);
  });

  test("Should get all basic records", async () => {
    const records = [basicRecordA, basicRecordB];
    storageService.getAll.mockResolvedValue(records);
    const result = await basicStorage.getAll();
    expect(result).toEqual(records);
  });

  // tests error
  test("Should handle saving error", async () => {
    storageService.save.mockRejectedValue(new Error("Saving error"));
    await expect(basicStorage.save(basicRecordProps)).rejects.toThrow(
      "Saving error"
    );
  });

  test("Should handle deleting error", async () => {
    storageService.delete.mockRejectedValue(new Error("Deleting error"));
    await expect(basicStorage.delete(basicRecordA)).rejects.toThrow(
      "Deleting error"
    );
  });

  test("Should handle updating error", async () => {
    storageService.update.mockRejectedValue(new Error("Updating error"));
    await expect(basicStorage.update(basicRecordA)).rejects.toThrow(
      "Updating error"
    );
  });

  test("Should handle finding error", async () => {
    storageService.findById.mockRejectedValue(new Error("Finding error"));
    await expect(basicStorage.findById(basicRecordA.id)).rejects.toThrow(
      "Finding error"
    );
  });

  test("Should handle not found", async () => {
    storageService.findById.mockResolvedValue(null);
    const result = await basicStorage.findById("nonexistentId");
    expect(result).toBeNull();
  });

  test("Should handle empty result", async () => {
    storageService.findAllByQuery.mockResolvedValue([]);
    const result = await basicStorage.findAllByQuery({ filter: {} });
    expect(result).toEqual([]);
  });

  test("Should handle empty result for getAll", async () => {
    storageService.getAll.mockResolvedValue([]);
    const result = await basicStorage.getAll();
    expect(result).toEqual([]);
  });
});
