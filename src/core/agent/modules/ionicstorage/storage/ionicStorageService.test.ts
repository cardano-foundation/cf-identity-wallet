import {
  AgentContext,
  AgentConfig,
  DependencyManager,
  InjectionSymbols,
  StorageVersionRecord,
} from "@aries-framework/core";
import { IonicStorageService } from "./ionicStorageService";
import { agentDependencies } from "../../../agent";
import { IonicStorageWallet } from "../wallet";
import { TestRecord } from "./testRecord";

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
  } else if (id === storageVersionRecord.id) {
    return {
      category: StorageVersionRecord.name,
      name: storageVersionRecord.id,
      value: JSON.stringify({ id: "storagerecord-0", storageVersion: "0.0.1" }),
      tags: {},
    };
  }
  return undefined;
});
const forEachMock = jest.fn().mockImplementation((fn: () => void) => {
  const items = [
    {
      category: TestRecord.type,
      name: existingRecord.id,
      value: JSON.stringify({
        id: "test-0",
        updatedAt: startTime,
      }),
      tags: { firstTag: "exists", secondTag: "exists" },
    },
    {
      category: TestRecord.type,
      name: existingRecord.id,
      value: JSON.stringify({
        id: "test-0",
        updatedAt: startTime,
      }),
      tags: { firstTag: "exists2", secondTag: "exists2" },
    },

    {
      category: TestRecord.type,
      name: existingRecord.id,
      value: JSON.stringify({
        id: "test-0",
        updatedAt: startTime,
      }),
      tags: { firstTag: "exists3", secondTag: "exists3" },
    },

    {
      category: StorageVersionRecord.name,
      name: storageVersionRecord.id,
      value: JSON.stringify({ id: "storagerecord-0", storageVersion: "0.0.1" }),
      tags: {},
    },
  ];
  items.forEach(fn);
});
jest.mock("../wallet", () => ({
  IonicStorageWallet: jest.fn().mockImplementation(() => {
    return {
      store: {
        set: setMock,
        get: getMock,
        remove: removeMock,
        forEach: forEachMock,
      },
    };
  }),
}));
jest.mock("./utils", () => ({
  ...jest.requireActual("./utils"),
  assertIonicStorageWallet: jest.fn(),
}));

// ------ TEST OBJECTS ------
const existingRecord = new TestRecord({
  id: "test1",
  testField: "testField1",
  createdAt: startTime,
});
const updatedRecord = new TestRecord({
  id: "test1",
  testField: "testField2",
  createdAt: startTime,
});
const newRecord = new TestRecord({
  id: "test3",
  testField: "testField3",
  createdAt: startTime,
});
const storageVersionRecord = new StorageVersionRecord({
  id: "storagerecord-0",
  storageVersion: "0.0.1",
});
const storageService = new IonicStorageService();
let agentContext: AgentContext;

beforeAll(async () => {
  const walletConfig = {
    id: "ionic-storage-service-test-wallet",
    key: "testkey",
  };
  const agentConfig = new AgentConfig(
    {
      label: "ionic-storage-service-test-agent",
      walletConfig: walletConfig,
    },
    agentDependencies
  );
  const wallet = new IonicStorageWallet();
  const dependencyManager = new DependencyManager();
  dependencyManager.registerInstance(InjectionSymbols.Wallet, wallet);
  dependencyManager.registerInstance(AgentConfig, agentConfig);
  agentContext = new AgentContext({
    dependencyManager,
    contextCorrelationId: "ionic-storage-service-test",
  });
});

describe("Aries - Ionic Storage Module: Storage Service", () => {
  test("should be able to store a new record", async () => {
    await storageService.save(agentContext, newRecord);
    expect(setMock).toBeCalledWith(newRecord.id, {
      category: newRecord.type,
      name: newRecord.id,
      value: JSON.stringify(newRecord),
      tags: {},
    });
  });

  test("should not be able to store an already existing record", async () => {
    await expect(
      storageService.save(agentContext, existingRecord)
    ).rejects.toThrowError(
      `${IonicStorageService.RECORD_ALREADY_EXISTS_ERROR_MSG} ${existingRecord.id}`
    );
    expect(setMock).not.toBeCalled();
  });

  test("updatedAt timestamp should be bumped after saving", async () => {
    await storageService.save(agentContext, newRecord);
    expect(setMock).toBeCalledWith(newRecord.id, {
      category: newRecord.type,
      name: newRecord.id,
      value: JSON.stringify(newRecord),
      tags: {},
    });
    expect(newRecord.updatedAt?.getTime()).toBeGreaterThan(startTime.getTime());
  });

  test("should be able to update an already existing record", async () => {
    await storageService.update(agentContext, updatedRecord);
    expect(setMock).toBeCalledWith(updatedRecord.id, {
      category: updatedRecord.type,
      name: updatedRecord.id,
      value: JSON.stringify(updatedRecord),
      tags: {},
    });
  });

  test("should not be able to update a record that does not exist", async () => {
    await expect(
      storageService.update(agentContext, newRecord)
    ).rejects.toThrowError(
      `${IonicStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(setMock).not.toBeCalled();
  });

  test("updatedAt timestamp should be bumped after saving", async () => {
    await storageService.update(agentContext, updatedRecord);
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
    await storageService.delete(agentContext, existingRecord);
    expect(getMock).toBeCalledWith(existingRecord.id);
    expect(removeMock).toBeCalledWith(existingRecord.id);
  });

  test("should not be able to delete a record that does not exist", async () => {
    await expect(
      storageService.delete(agentContext, newRecord)
    ).rejects.toThrowError(
      `${IonicStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(getMock).toBeCalledWith(newRecord.id);
    expect(removeMock).not.toBeCalled();
  });

  test("should be able to delete an existing record by id", async () => {
    await storageService.deleteById(
      agentContext,
      TestRecord,
      existingRecord.id
    );
    expect(getMock).toBeCalledWith(existingRecord.id);
    expect(removeMock).toBeCalledWith(existingRecord.id);
  });

  test("should not be able to delete a record by id that does not exist", async () => {
    await expect(
      storageService.deleteById(agentContext, TestRecord, newRecord.id)
    ).rejects.toThrowError(
      `${IonicStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(getMock).toBeCalledWith(newRecord.id);
    expect(removeMock).not.toBeCalled();
  });

  test("should get an existing record", async () => {
    const record = await storageService.getById(
      agentContext,
      TestRecord,
      existingRecord.id
    );
    expect(getMock).toBeCalledWith(existingRecord.id);
    expect(record.type).toEqual(TestRecord.type);
    expect(record.id).toEqual(existingRecord.id);
  });

  test("should throw an error if trying to retrieve a record that does not exist", async () => {
    await expect(
      storageService.getById(agentContext, TestRecord, newRecord.id)
    ).rejects.toThrow(
      `${IonicStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(getMock).toBeCalledWith(newRecord.id);
  });

  test("should return all items for a record type but none others", async () => {
    const result = await storageService.getAll(agentContext, TestRecord);
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(3);
    expect(result[0].id).toEqual(existingRecord.id);
  });

  test("should find an item if every record tag is part of the query", async () => {
    const tags = { firstTag: "exists", secondTag: "exists" };
    const result = await storageService.findByQuery(
      agentContext,
      TestRecord,
      tags
    );
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(1);
  });

  test("should find an item if every query tag is part of the record tags", async () => {
    const tags = { firstTag: "exists" };
    const result = await storageService.findByQuery(
      agentContext,
      TestRecord,
      tags
    );
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(1);
  });

  test("should not find an item by tag that doesn't exist", async () => {
    const tags = { doesNotExist: "doesNotExist" };
    const result = await storageService.findByQuery(
      agentContext,
      TestRecord,
      tags
    );
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(0);
  });

  test("should only return an item if every tag matches", async () => {
    const tags = { firstTag: "exists", secondTag: "doesNotExist" };
    const result = await storageService.findByQuery(
      agentContext,
      TestRecord,
      tags
    );
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(0);
  });

  test("should find items with $or query", async () => {
    const query = { $or: [{ firstTag: "exists" }, { firstTag: "exists2" }] };
    const result = await storageService.findByQuery(
      agentContext,
      TestRecord,
      query
    );
    expect(forEachMock).toBeCalled();
    expect(result).toMatchObject([
      {
        _tags: { firstTag: "exists", secondTag: "exists" },
        type: "TestRecord",
        metadata: { data: {} },
        id: "test1",
        updatedAt: startTime,
      },
      {
        _tags: { firstTag: "exists2", secondTag: "exists2" },
        type: "TestRecord",
        metadata: { data: {} },
        id: "test1",
        updatedAt: startTime,
      },
    ]);
  });

  test("should find items with $not query", async () => {
    const query = { $not: { firstTag: "exists" } };
    const result = await storageService.findByQuery(
      agentContext,
      TestRecord,
      query
    );
    expect(forEachMock).toBeCalled();
    expect(result).toMatchObject([
      {
        _tags: { firstTag: "exists2", secondTag: "exists2" },
        type: "TestRecord",
        metadata: { data: {} },
        id: "test1",
        updatedAt: startTime,
      },
      {
        _tags: { firstTag: "exists3", secondTag: "exists3" },
        type: "TestRecord",
        metadata: { data: {} },
        id: "test1",
        updatedAt: startTime,
      },
    ]);
  });

  test("should find an item with $and query", async () => {
    const tags = { $and: [{ firstTag: "exists" }, { secondTag: "exists" }] };
    const result = await storageService.findByQuery(
      agentContext,
      TestRecord,
      tags
    );
    expect(forEachMock).toBeCalled();
    expect(result.length).toEqual(1);
  });
});
