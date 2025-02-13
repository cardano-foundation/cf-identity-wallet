import {
  Query,
  StorageMessage,
  StorageService,
} from "../../storage/storage.types";
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
    jest
      .spyOn(global, "Date")
      .mockImplementation(() => fixedDate as unknown as string);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("Should save basic record", async () => {
    await basicStorage.save(basicRecordProps);
    expect(storageService.save).toBeCalledWith(basicRecordA);
  });

  test("Should delete basic record", async () => {
    await basicStorage.delete(basicRecordA);
    expect(storageService.delete).toBeCalledWith(basicRecordA);
  });

  test("Should delete basic record by ID", async () => {
    await basicStorage.deleteById(basicRecordA.id);
    expect(storageService.deleteById).toBeCalledWith(basicRecordA.id);
  });

  test("Should update basic record", async () => {
    await basicStorage.update(basicRecordA);
    expect(storageService.update).toBeCalledWith(basicRecordA);
  });

  test("Should find basic record by ID", async () => {
    storageService.findById.mockResolvedValue(basicRecordA);
    const result = await basicStorage.findById(basicRecordA.id);
    expect(result).toEqual(basicRecordA);
  });

  test("Should be able to find an expected record by ID", async () => {
    storageService.findById.mockResolvedValue(basicRecordA);
    const result = await basicStorage.findExpectedById(basicRecordA.id);
    expect(result).toEqual(basicRecordA);
  });

  test("Should error if we cannot find an expected record by ID", async () => {
    storageService.findById.mockResolvedValue(null);
    await expect(
      basicStorage.findExpectedById(basicRecordA.id)
    ).rejects.toThrowError(StorageMessage.RECORD_DOES_NOT_EXIST_ERROR_MSG);
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

  test("createOrUpdateBasicRecord update existing records", async () => {
    storageService.update.mockResolvedValue();
    await basicStorage.createOrUpdateBasicRecord(basicRecordA);
    expect(storageService.update).toBeCalledWith(basicRecordA);
    expect(storageService.save).not.toBeCalled();
  });

  test("createOrUpdateBasicRecord should create record if it does not exist", async () => {
    storageService.update.mockRejectedValue(
      new Error(`${StorageMessage.RECORD_DOES_NOT_EXIST_ERROR_MSG} id1`)
    );
    await basicStorage.createOrUpdateBasicRecord(basicRecordA);
    expect(storageService.save).toBeCalledWith(basicRecordA);
  });

  test("createOrUpdateBasicRecord should error for unexpected errors when updating", async () => {
    storageService.update.mockRejectedValue(new Error("Unknown error"));
    await expect(
      basicStorage.createOrUpdateBasicRecord(basicRecordA)
    ).rejects.toThrowError("Unknown error");
    expect(storageService.save).not.toBeCalled();
  });
});
