import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  BaseRecord,
  AgentContext,
  StorageService,
  BaseRecordConstructor,
  Query,
  RecordNotFoundError,
  JsonTransformer,
  RecordDuplicateError,
} from "@aries-framework/core";
import {
  TagDataType,
  assertSqliteStorageWallet,
  convertDbQuery,
  deserializeRecord,
  isNilOrEmptyString,
  resolveTagsFromDb,
} from "./utils";
import { StorageObject } from "./sqliteStorageService.types";

class SqliteStorageService<T extends BaseRecord> implements StorageService<T> {
  static readonly RECORD_ALREADY_EXISTS_ERROR_MSG =
    "Record already exists with id";
  static readonly RECORD_DOES_NOT_EXIST_ERROR_MSG =
    "Record does not exist with id";
  static readonly INSERT_ITEM_TAG_SQL =
    "INSERT INTO items_tags (item_id, name, value, type) VALUES (?,?,?,?)";
  static readonly DELETE_ITEM_TAGS_SQL =
    "DELETE FROM items_tags where item_id = ?";
  static readonly DELETE_ITEM_SQL = "DELETE FROM items where id = ?";
  static readonly GET_ITEM_SQL =
    "SELECT category, name, value, (SELECT group_concat(it.type || '|' || it.name || '|' || it.value) FROM items_tags it WHERE it.item_id = i.id) tags FROM items i WHERE id = ?";
  static readonly INSERT_ITEMS_SQL =
    "INSERT OR IGNORE INTO items (id, category, name, value) VALUES (?,?,?,?)";
  static readonly UPDATE_ITEMS_SQL =
    "UPDATE items set category = ?, name = ?, value = ? where id = ?";
  static readonly SCAN_QUERY_SQL = `SELECT category, name, value,
    (SELECT group_concat(it.type || '|' || it.name || '|' || it.value)
        FROM items_tags it WHERE it.item_id = i.id) tags
    FROM items i WHERE category = ?`;
  static readonly SCAN_TAGS_SQL_EQ =
    "EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value = ?)";
  static readonly SCAN_TAGS_SQL_IN =
    "EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value IN ";

  async save(agentContext: AgentContext, record: T): Promise<void> {
    assertSqliteStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    record.updatedAt = new Date();

    const value = JsonTransformer.serialize(record);
    const tags = record.getTags() as Record<string, string>;

    if (await this.getItem(session, record.id)) {
      throw new RecordDuplicateError(
        `${SqliteStorageService.RECORD_ALREADY_EXISTS_ERROR_MSG} ${record.id}`,
        { recordType: record.type }
      );
    }

    await this.createItem(session, record.id, {
      category: record.type,
      name: record.id,
      value,
      tags,
    });
  }

  async update(agentContext: AgentContext, record: T): Promise<void> {
    assertSqliteStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    // @TODO - foconnor: We should wrap get to enforce type here.
    if (!(await this.getItem(session, record.id))) {
      throw new RecordNotFoundError(
        `${SqliteStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`,
        { recordType: record.type }
      );
    }

    record.updatedAt = new Date();

    const value = JsonTransformer.serialize(record);
    const tags = record.getTags() as Record<string, string>;

    await this.updateItem(session, record.id, {
      category: record.type,
      name: record.id,
      value,
      tags,
    });
  }

  async delete(agentContext: AgentContext, record: T): Promise<void> {
    assertSqliteStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    if (!(await this.getItem(session, record.id))) {
      throw new RecordNotFoundError(
        `${SqliteStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`,
        { recordType: record.type }
      );
    }

    await this.deleteItem(session, record.id);
  }

  async deleteById(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<void> {
    assertSqliteStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    if (!(await this.getItem(session, id))) {
      throw new RecordNotFoundError(
        `${SqliteStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${id}`,
        { recordType: recordClass.type }
      );
    }

    await this.deleteItem(session, id);
  }

  async getById(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<T> {
    assertSqliteStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    // @TODO - foconnor: Missing check for recordClass type.
    const record = await this.getItem(session, id);

    if (!record) {
      throw new RecordNotFoundError(
        `${SqliteStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${id}`,
        { recordType: recordClass.type }
      );
    }
    return deserializeRecord(record, recordClass);
  }

  async getAll(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>
  ): Promise<T[]> {
    assertSqliteStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;
    const instances: T[] = [];

    const records = await this.scanItems(session, recordClass.type);

    records.forEach((value) => {
      instances.push(deserializeRecord(value, recordClass));
    });

    return instances;
  }

  async findByQuery(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    query: Query<T>
  ): Promise<T[]> {
    assertSqliteStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;
    const instances: T[] = [];

    // Right now we just support SimpleQuery and not AdvancedQuery as it's not something we need right now.
    // This is also really inefficient but OK for now.

    const records = await this.scanItems(session, recordClass.type, query);
    records.forEach((value) => {
      instances.push(deserializeRecord(value, recordClass));
    });
    return instances;
  }

  async getItem(
    session: SQLiteDBConnection,
    id: string
  ): Promise<StorageObject | undefined> {
    const qValues = await session.query(SqliteStorageService.GET_ITEM_SQL, [
      id,
    ]);
    if (qValues && qValues.values && qValues.values.length === 1) {
      return {
        ...qValues.values[0],
        tags: resolveTagsFromDb(qValues.values[0].tags),
      } as StorageObject;
    }
    return undefined;
  }

  async scanItems(
    session: SQLiteDBConnection,
    category: string,
    query?: Query<T>
  ): Promise<StorageObject[]> {
    const values = [category];
    let scan_query = SqliteStorageService.SCAN_QUERY_SQL;
    if (query) {
      const dbQuery = convertDbQuery(query);
      for (const [queryKey, queryVal] of Object.entries(dbQuery)) {
        if (Array.isArray(queryVal)) {
          const generateValueFinds = Array.from("?".repeat(queryVal.length));
          scan_query +=
            " AND " +
            SqliteStorageService.SCAN_TAGS_SQL_IN +
            "(" +
            generateValueFinds.join() +
            "))";
          values.push(queryKey, ...queryVal);
        } else {
          scan_query += " AND " + SqliteStorageService.SCAN_TAGS_SQL_EQ;
          values.push(queryKey, queryVal as string);
        }
      }
    }
    const qValues = await session.query(scan_query, values);
    if (qValues && qValues.values && qValues.values.length > 0) {
      return qValues.values.map((record) => {
        return {
          ...record,
          tags: resolveTagsFromDb(record.tags),
        } as StorageObject;
      });
    }
    return [];
  }

  async createItem(
    session: SQLiteDBConnection,
    id: string,
    sObject: StorageObject
  ): Promise<void> {
    const transactionStatements = [];
    transactionStatements.push({
      statement: SqliteStorageService.INSERT_ITEMS_SQL,
      values: [id, sObject.category, sObject.name, sObject.value],
    });
    transactionStatements.push(...this.getTagsInsertSql(id, sObject.tags));
    await session.executeSet(transactionStatements);
  }

  async updateItem(
    session: SQLiteDBConnection,
    id: string,
    sObject: StorageObject
  ): Promise<void> {
    const transactionStatements = [];

    transactionStatements.push({
      statement: SqliteStorageService.UPDATE_ITEMS_SQL,
      values: [sObject.category, sObject.name, sObject.value, id],
    });
    transactionStatements.push({
      statement: SqliteStorageService.DELETE_ITEM_TAGS_SQL,
      values: [id],
    });
    transactionStatements.push(...this.getTagsInsertSql(id, sObject.tags));
    await session.executeSet(transactionStatements);
  }

  async deleteItem(session: SQLiteDBConnection, id: string): Promise<void> {
    const transactionStatements = [
      {
        statement: SqliteStorageService.DELETE_ITEM_SQL,
        values: [id],
      },
      {
        statement: SqliteStorageService.DELETE_ITEM_TAGS_SQL,
        values: [id],
      },
    ];
    await session.executeSet(transactionStatements);
  }

  private getTagsInsertSql(itemId: string, tags: Record<string, unknown>) {
    const statements = [];
    for (const key in tags) {
      if (isNilOrEmptyString(tags[key])) continue;
      if (Array.isArray(tags[key])) {
        (tags[key] as Array<string>).forEach((value) => {
          if (!isNilOrEmptyString(value)) {
            statements.push({
              statement: SqliteStorageService.INSERT_ITEM_TAG_SQL,
              values: [itemId, key, value, TagDataType.ARRAY],
            });
          }
        });
      } else if (typeof tags[key] == "boolean") {
        const value = tags[key] ? "1" : "0";
        statements.push({
          statement: SqliteStorageService.INSERT_ITEM_TAG_SQL,
          values: [itemId, key, value, TagDataType.BOOLEAN],
        });
      } else {
        statements.push({
          statement: SqliteStorageService.INSERT_ITEM_TAG_SQL,
          values: [itemId, key, tags[key], TagDataType.STRING],
        });
      }
    }
    return statements;
  }
}

export { SqliteStorageService };
