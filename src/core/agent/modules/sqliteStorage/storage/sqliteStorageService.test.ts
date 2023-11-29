import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  AgentContext,
  AgentConfig,
  DependencyManager,
  InjectionSymbols,
  StorageVersionRecord,
} from "@aries-framework/core";
import { SqliteStorageService } from "./sqliteStorageService";
import { agentDependencies } from "../../../agent";
import { SqliteStorageWallet } from "../wallet";
import { TestRecord } from "./testRecord";
import { StorageObject } from "./sqliteStorageService.types";
import { convertDbQuery } from "./utils";

const startTime = new Date();

// ------ MOCKS ------
const setMock = jest
  .spyOn(SqliteStorageService.prototype, "createItem")
  .mockImplementation();
const updateMock = jest
  .spyOn(SqliteStorageService.prototype, "updateItem")
  .mockImplementation();
const removeMock = jest
  .spyOn(SqliteStorageService.prototype, "deleteItem")
  .mockImplementation();
const getMock = jest
  .spyOn(SqliteStorageService.prototype, "getItem")
  .mockImplementation(async (session: SQLiteDBConnection, id: string) => {
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
        value: JSON.stringify({
          id: "storagerecord-0",
          storageVersion: "0.0.1",
        }),
        tags: {},
      };
    }
    return undefined;
  });
const getAllKvMock = jest
  .spyOn(SqliteStorageService.prototype, "scanItems")
  .mockImplementation(
    async (
      session: SQLiteDBConnection,
      category: string,
      query
    ): Promise<StorageObject[]> => {
      const records = [
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
          category: StorageVersionRecord.name,
          name: storageVersionRecord.id,
          value: JSON.stringify({
            id: "storagerecord-0",
            storageVersion: "0.0.1",
          }),
          tags: { firstTag: "exists", secondTag: "exists" },
        },
      ].filter((e) => e.category == category) as StorageObject[];
      let instances: StorageObject[] = [];
      if (query) {
        records.forEach((record) => {
          if (record.category && record.category === category) {
            for (const [queryKey, queryVal] of Object.entries(query)) {
              if (
                record.tags[queryKey] !== queryVal &&
                queryVal !== undefined
              ) {
                return;
              }
            }
            instances.push(record);
          }
        });
      } else {
        instances = records;
      }
      return instances;
    }
  );

const storeSessionMock = {};
jest.mock("../wallet", () => ({
  SqliteStorageWallet: jest.fn().mockImplementation(() => {
    return {
      store: storeSessionMock,
    };
  }),
}));
jest.mock("./utils", () => ({
  ...jest.requireActual("./utils"),
  assertSqliteStorageWallet: jest.fn(),
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
const storageService = new SqliteStorageService();
let agentContext: AgentContext;

beforeAll(async () => {
  const walletConfig = {
    id: "sqlite-storage-service-test-wallet",
    key: "testkey",
  };
  const agentConfig = new AgentConfig(
    {
      label: "sqlite-storage-service-test-agent",
      walletConfig: walletConfig,
    },
    agentDependencies
  );
  const wallet = new SqliteStorageWallet();
  const dependencyManager = new DependencyManager();
  dependencyManager.registerInstance(InjectionSymbols.Wallet, wallet);
  dependencyManager.registerInstance(AgentConfig, agentConfig);
  agentContext = new AgentContext({
    dependencyManager,
    contextCorrelationId: "sqlite-storage-service-test",
  });
});

describe("Aries - Sqlite Storage Module: Storage Service", () => {
  test("should be able to store a new record", async () => {
    await storageService.save(agentContext, newRecord);
    expect(setMock).toBeCalledWith(storeSessionMock, newRecord.id, {
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
      `${SqliteStorageService.RECORD_ALREADY_EXISTS_ERROR_MSG} ${existingRecord.id}`
    );
    expect(setMock).not.toBeCalled();
  });

  test("updatedAt timestamp should be bumped after saving", async () => {
    await storageService.save(agentContext, newRecord);
    expect(setMock).toBeCalledWith(storeSessionMock, newRecord.id, {
      category: newRecord.type,
      name: newRecord.id,
      value: JSON.stringify(newRecord),
      tags: {},
    });
    expect(newRecord.updatedAt?.getTime()).toBeGreaterThan(startTime.getTime());
  });

  test("should be able to update an already existing record", async () => {
    await storageService.update(agentContext, updatedRecord);
    expect(updateMock).toBeCalledWith(storeSessionMock, updatedRecord.id, {
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
      `${SqliteStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(updateMock).not.toBeCalled();
  });

  test("should be able to delete an existing record", async () => {
    await storageService.delete(agentContext, existingRecord);
    expect(getMock).toBeCalledWith(storeSessionMock, existingRecord.id);
    expect(removeMock).toBeCalledWith(storeSessionMock, existingRecord.id);
  });

  test("should not be able to delete a record that does not exist", async () => {
    await expect(
      storageService.delete(agentContext, newRecord)
    ).rejects.toThrowError(
      `${SqliteStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(getMock).toBeCalledWith(storeSessionMock, newRecord.id);
    expect(removeMock).not.toBeCalled();
  });

  test("should be able to delete an existing record by id", async () => {
    await storageService.deleteById(
      agentContext,
      TestRecord,
      existingRecord.id
    );
    expect(getMock).toBeCalledWith(storeSessionMock, existingRecord.id);
    expect(removeMock).toBeCalledWith(storeSessionMock, existingRecord.id);
  });

  test("should not be able to delete a record by id that does not exist", async () => {
    await expect(
      storageService.deleteById(agentContext, TestRecord, newRecord.id)
    ).rejects.toThrowError(
      `${SqliteStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(getMock).toBeCalledWith(storeSessionMock, newRecord.id);
    expect(removeMock).not.toBeCalled();
  });

  test("should get an existing record", async () => {
    const record = await storageService.getById(
      agentContext,
      TestRecord,
      existingRecord.id
    );
    expect(getMock).toBeCalledWith(storeSessionMock, existingRecord.id);
    expect(record.type).toEqual(TestRecord.type);
    expect(record.id).toEqual(existingRecord.id);
  });

  test("should throw an error if trying to retrieve a record that does not exist", async () => {
    await expect(
      storageService.getById(agentContext, TestRecord, newRecord.id)
    ).rejects.toThrow(
      `${SqliteStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${newRecord.id}`
    );
    expect(getMock).toBeCalledWith(storeSessionMock, newRecord.id);
  });

  test("should return all items for a record type but none others", async () => {
    const result = await storageService.getAll(agentContext, TestRecord);
    expect(getAllKvMock).toBeCalled();
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual(existingRecord.id);
  });

  test("should find an item if every record tag is part of the query", async () => {
    const tags = { firstTag: "exists", secondTag: "exists" };
    const result = await storageService.findByQuery(
      agentContext,
      TestRecord,
      tags
    );
    expect(getAllKvMock).toBeCalled();
    expect(result.length).toEqual(1);
  });

  test("should find an item if every query tag is part of the record tags", async () => {
    const tags = { firstTag: "exists" };
    const result = await storageService.findByQuery(
      agentContext,
      TestRecord,
      tags
    );
    expect(getAllKvMock).toBeCalled();
    expect(result.length).toEqual(1);
  });

  test("should not find an item by tag that doesn't exist", async () => {
    const tags = { doesNotExist: "doesNotExist" };
    const result = await storageService.findByQuery(
      agentContext,
      TestRecord,
      tags
    );
    expect(getAllKvMock).toBeCalled();
    expect(result.length).toEqual(0);
  });

  test("should only return an item if every tag matches", async () => {
    const tags = { firstTag: "exists", secondTag: "doesNotExist" };
    const result = await storageService.findByQuery(
      agentContext,
      TestRecord,
      tags
    );
    expect(getAllKvMock).toBeCalled();
    expect(result.length).toEqual(0);
  });
  test("should generate exactly sql condition normal", () => {
    const query = { firstTag: "exists", secondTag: "doesNotExist" };
    const expectedCondition =
      "EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?) AND EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?)";
    const expectdValues = ["firstTag", "exists", "secondTag", "doesNotExist"];
    const { condition, values } = storageService.getQueryConditionSql(query);
    expect(condition).toEqual(expectedCondition);
    expect(values).toMatchObject(expectdValues);
  });

  test("should generate exactly sql condition $and", () => {
    const query = {
      $and: [{ firstTag: "exists" }, { firstTag: "doesNotExist" }],
    };
    const expectedCondition =
      "(EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?)) AND (EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?))";
    const expectdValues = ["firstTag", "exists", "firstTag", "doesNotExist"];
    const { condition, values } = storageService.getQueryConditionSql(query);
    expect(condition).toEqual(expectedCondition);
    expect(values).toMatchObject(expectdValues);
  });

  test("should generate exactly sql condition $OR", () => {
    const query = {
      $or: [{ firstTag: "exists" }, { secondTag: "doesNotExist" }],
    };
    const expectedCondition =
      "(EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?)) OR (EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?))";
    const expectdValues = ["firstTag", "exists", "secondTag", "doesNotExist"];
    const { condition, values } = storageService.getQueryConditionSql(query);
    expect(condition).toEqual(expectedCondition);
    expect(values).toMatchObject(expectdValues);
  });

  test("should generate exactly sql condition $NOT", () => {
    const query = {
      $not: { firstTag: "exists", secondTag: "doesNotExist" },
    };
    const expectedCondition =
      "NOT (EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?) AND EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?))";
    const expectdValues = ["firstTag", "exists", "secondTag", "doesNotExist"];
    const { condition, values } = storageService.getQueryConditionSql(query);
    expect(condition).toEqual(expectedCondition);
    expect(values).toMatchObject(expectdValues);
  });
  test("should generate exactly sql condition complex", () => {
    const query = {
      $not: { firstTag: "exists" },
      $or: [{ firstTag: "doesNotExist" }, { secondTag: "doesNotExist" }],
      thirdTag: "exists",
    };
    const expectedCondition =
      "NOT (EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?)) AND (EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?)) OR (EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?)) AND EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?)";
    const expectdValues = [
      "firstTag",
      "exists",
      "firstTag",
      "doesNotExist",
      "secondTag",
      "doesNotExist",
      "thirdTag",
      "exists",
    ];
    const { condition, values } = storageService.getQueryConditionSql(query);
    expect(condition).toEqual(expectedCondition);
    expect(values).toMatchObject(expectdValues);
  });

  test("should generate exactly sql condition complex $or in $and", () => {
    const query = {
      $and: [
        { $or: [{ firstTag: "doesNotExist" }, { secondTag: "doesNotExist" }] },
        { thirdTag: "exists", otherTag: "exists" },
      ],
    };
    const expectedCondition =
      "((EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?)) OR (EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?))) AND (EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?) AND EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?))";
    const expectdValues = [
      "firstTag",
      "doesNotExist",
      "secondTag",
      "doesNotExist",
      "thirdTag",
      "exists",
      "otherTag",
      "exists",
    ];
    const { condition, values } = storageService.getQueryConditionSql(query);
    expect(condition).toEqual(expectedCondition);
    expect(values).toMatchObject(expectdValues);
  });
});

describe("Aries - Sqlite Storage Module: Util", () => {
  test("convertDbQuery should work correctly", () => {
    const query = {
      field1: undefined,
      field2: true,
      field3: false,
      field4: "string",
    };
    expect(convertDbQuery(query)).toEqual({
      field2: "1",
      field3: "0",
      field4: "string",
    });
  });
});
