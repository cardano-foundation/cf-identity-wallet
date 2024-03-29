import { IonicStorage } from "./ionicStorage";
import { BasicRecord, RecordType } from "../storage.types";

const startTime = new Date();

// ------ MOCKS ------

const setMock = jest.fn();
const removeMock = jest.fn();
const getMock = jest.fn().mockImplementation(async (id: string) => {
  if (id === existingRecord.id) {
    return {
      category: existingRecord.type,
      name: existingRecord.id,
      value: JSON.stringify({
        id: "test1",
        testField: "testField1",
        updatedAt: startTime,
      }),
      tags: {},
    };
  }
  return undefined;
});
const forEachMock = jest.fn().mockImplementation((fn: () => void) => {
  const items = [
    {
      category: RecordType.CONNECTION_KERI_METADATA,
      name: existingRecord.id,
      value: JSON.stringify({
        id: "test-0",
        updatedAt: startTime,
      }),
      tags: { firstTag: "exists", secondTag: "exists" },
    },
    {
      category: RecordType.CONNECTION_KERI_METADATA,
      name: existingRecord.id,
      value: JSON.stringify({
        id: "test-0",
        updatedAt: startTime,
      }),
      tags: { firstTag: "exists2", secondTag: "exists2" },
    },

    {
      category: RecordType.CONNECTION_KERI_METADATA,
      name: existingRecord.id,
      value: JSON.stringify({
        id: "test-0",
        updatedAt: startTime,
      }),
      tags: { firstTag: "exists3", secondTag: "exists3" },
    },
  ];
  items.forEach(fn);
});

jest.mock("@ionic/storage", () => ({
  Storage: jest.fn().mockImplementation(() => {
    return {
      set: setMock,
      get: getMock,
      remove: removeMock,
      forEach: forEachMock,
      create: jest.fn(),
    };
  }),
  Drivers: {
    IndexedDB: "IndexedDB",
  },
}));

// ------ TEST OBJECTS ------
const existingRecord = new BasicRecord({
  id: "test1",
  content: {
    test: "1",
  },
  type: RecordType.CONNECTION_KERI_METADATA,
  createdAt: startTime,
});
const updatedRecord = new BasicRecord({
  id: "test1",
  content: {
    test: "1",
  },
  type: RecordType.CONNECTION_KERI_METADATA,
  createdAt: startTime,
});
const newRecord = new BasicRecord({
  id: "test3",
  content: {
    test: "1",
  },
  type: RecordType.CONNECTION_KERI_METADATA,
  createdAt: startTime,
});

const storageService = new IonicStorage();

beforeAll(async () => {
  const walletConfig = {
    id: "ionic-storage-service-test-wallet",
    key: "testkey",
  };
  await storageService.open(walletConfig.id);
});

describe("Ionic Storage Module: Basic Storage Service", () => {
  test("should be able to store a new record", async () => {
    await storageService.save(newRecord);
    expect(setMock).toBeCalledWith(newRecord.id, {
      category: newRecord.type,
      name: newRecord.id,
      value: expect.any(String),
      tags: {},
    });
  });

  test("should not be able to store an already existing record", async () => {
    await expect(storageService.save(existingRecord)).rejects.toThrowError(
      `${IonicStorage.RECORD_ALREADY_EXISTS_ERROR_MSG} ${existingRecord.id}`
    );
    expect(setMock).not.toBeCalled();
  });

  test("should be able to update an already existing record", async () => {
    await storageService.update(updatedRecord);
    expect(setMock).toBeCalledWith(updatedRecord.id, {
      category: updatedRecord.type,
      name: updatedRecord.id,
      value: JSON.stringify(updatedRecord),
      tags: {},
    });
  });

  test("should not be able to update a record that does not exist", async () => {
    await expect(storageService.update(newRecord)).rejects.toThrowError(
      `${IonicStorage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(setMock).not.toBeCalled();
  });

  test("updatedAt timestamp should be bumped after saving", async () => {
    await storageService.update(updatedRecord);
    expect(setMock).toBeCalledWith(updatedRecord.id, {
      category: updatedRecord.type,
      name: updatedRecord.id,
      value: JSON.stringify(updatedRecord),
      tags: {},
    });
    expect(updatedRecord.updatedAt?.getTime()).toBeGreaterThan(
      startTime.getTime()
    );
  });

  test("should be able to delete an existing record", async () => {
    await storageService.delete(existingRecord);
    expect(getMock).toBeCalledWith(existingRecord.id);
    expect(removeMock).toBeCalledWith(existingRecord.id);
  });

  test("should not be able to delete a record that does not exist", async () => {
    await expect(storageService.delete(newRecord)).rejects.toThrowError(
      `${IonicStorage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(getMock).toBeCalledWith(newRecord.id);
    expect(removeMock).not.toBeCalled();
  });

  test("should be able to delete an existing record by id", async () => {
    await storageService.deleteById(existingRecord.id);
    expect(getMock).toBeCalledWith(existingRecord.id);
    expect(removeMock).toBeCalledWith(existingRecord.id);
  });

  test("should not be able to delete a record by id that does not exist", async () => {
    await expect(storageService.deleteById(newRecord.id)).rejects.toThrowError(
      `${IonicStorage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(getMock).toBeCalledWith(newRecord.id);
    expect(removeMock).not.toBeCalled();
  });

  test("should get an existing record", async () => {
    const record = await storageService.findById(existingRecord.id);
    expect(getMock).toBeCalledWith(existingRecord.id);
    expect(record.type).toEqual(RecordType.CONNECTION_KERI_METADATA);
    expect(record.id).toEqual(existingRecord.id);
  });

  test("should throw an error if trying to retrieve a record that does not exist", async () => {
    await expect(storageService.findById(newRecord.id)).rejects.toThrow(
      `${IonicStorage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(getMock).toBeCalledWith(newRecord.id);
  });

  test("should return all items for a record type but none others", async () => {
    const result = await storageService.getAll(
      RecordType.CONNECTION_KERI_METADATA
    );
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(3);
    expect(result[0].id).toEqual(existingRecord.id);
  });

  test("should find an item if every record tag is part of the query", async () => {
    const tags = { firstTag: "exists", secondTag: "exists" };
    const result = await storageService.findAllByQuery(
      RecordType.CONNECTION_KERI_METADATA,
      tags
    );
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(1);
  });

  test("should find an item if every query tag is part of the record tags", async () => {
    const tags = { firstTag: "exists" };
    const result = await storageService.findAllByQuery(
      RecordType.CONNECTION_KERI_METADATA,
      tags
    );
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(1);
  });

  test("should not find an item by tag that doesn't exist", async () => {
    const tags = { doesNotExist: "doesNotExist" };
    const result = await storageService.findAllByQuery(
      RecordType.CONNECTION_KERI_METADATA,
      tags
    );
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(0);
  });

  test("should only return an item if every tag matches", async () => {
    const tags = { firstTag: "exists", secondTag: "doesNotExist" };
    const result = await storageService.findAllByQuery(
      RecordType.CONNECTION_KERI_METADATA,
      tags
    );
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(0);
  });

  test("should find items with $or query", async () => {
    const query = { $or: [{ firstTag: "exists" }, { firstTag: "exists2" }] };
    const result = await storageService.findAllByQuery(
      RecordType.CONNECTION_KERI_METADATA,
      query
    );
    expect(forEachMock).toBeCalled();
    expect(result).toMatchObject([
      {
        _tags: { firstTag: "exists", secondTag: "exists" },
        type: RecordType.CONNECTION_KERI_METADATA,
        id: "test1",
      },
      {
        _tags: { firstTag: "exists2", secondTag: "exists2" },
        type: RecordType.CONNECTION_KERI_METADATA,
        id: "test1",
      },
    ]);
  });

  test("should find items with $not query", async () => {
    const query = { $not: { firstTag: "exists" } };
    const result = await storageService.findAllByQuery(
      RecordType.CONNECTION_KERI_METADATA,
      query
    );
    expect(forEachMock).toBeCalled();
    expect(result).toMatchObject([
      {
        _tags: { firstTag: "exists2", secondTag: "exists2" },
        type: RecordType.CONNECTION_KERI_METADATA,
        id: "test1",
      },
      {
        _tags: { firstTag: "exists3", secondTag: "exists3" },
        type: RecordType.CONNECTION_KERI_METADATA,
        id: "test1",
      },
    ]);
  });

  test("should find an item with $and query", async () => {
    const tags = { $and: [{ firstTag: "exists" }, { secondTag: "exists" }] };
    const result = await storageService.findAllByQuery(
      RecordType.CONNECTION_KERI_METADATA,
      tags
    );
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(1);
  });
});
