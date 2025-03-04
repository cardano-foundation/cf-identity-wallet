import { SQLiteDBConnection } from "@capacitor-community/sqlite";
import {
  Query,
  StorageRecord,
  BaseRecord,
  StorageService,
  BaseRecordConstructor,
  StorageMessage,
} from "../storage.types";
import { TagDataType, convertDbQuery, isNil, resolveTagsFromDb } from "./utils";
import { deserializeRecord } from "../utils";
import { BasicRecord } from "../../agent/records";

class SqliteStorage<T extends BaseRecord> implements StorageService<T> {
  static readonly SESSION_IS_NOT_INITIALIZED = "Session is not initialized";
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
  static readonly SCAN_TAGS_SQL_NOT_EXIST =
    "NOT EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ?)";
  static readonly SCAN_TAGS_SQL_IN =
    "EXISTS (SELECT 1 FROM items_tags it WHERE i.id = it.item_id AND it.name = ? AND it.value IN ";

  private session: SQLiteDBConnection;

  constructor(session: SQLiteDBConnection) {
    this.session = session;
  }

  async save(record: T): Promise<T> {
    this.checkSession(this.session);
    record.updatedAt = new Date();

    if (await this.getItem(record.id)) {
      throw new Error(
        `${StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG} ${record.id}`
      );
    }

    await this.createItem(record.id, {
      category: record.type,
      name: record.id,
      value: JSON.stringify(record),
      tags: record.getTags(),
    });
    return record;
  }

  async update(record: T): Promise<void> {
    this.checkSession(this.session);

    if (!(await this.getItem(record.id))) {
      throw new Error(
        `${StorageMessage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`
      );
    }

    record.updatedAt = new Date();

    const tags = record.getTags() as Record<string, string>;

    await this.updateItem(record.id, {
      category: record.type,
      name: record.id,
      value: JSON.stringify(record),
      tags,
    });
  }

  async delete(record: T): Promise<void> {
    this.checkSession(this.session);

    if (!(await this.getItem(record.id))) {
      throw new Error(
        `${StorageMessage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`
      );
    }

    await this.deleteItem(record.id);
  }

  async deleteById(id: string): Promise<void> {
    this.checkSession(this.session);

    if (!(await this.getItem(id))) {
      throw new Error(
        `${StorageMessage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${id}`
      );
    }

    await this.deleteItem(id);
  }

  async findById(
    id: string,
    recordClass: BaseRecordConstructor<T>
  ): Promise<T | null> {
    this.checkSession(this.session);

    const record = await this.getItem(id);

    if (!record || record.category !== recordClass.type) {
      return null;
    }
    return deserializeRecord(record, recordClass);
  }

  async getAll(recordClass: BaseRecordConstructor<T>): Promise<T[]> {
    this.checkSession(this.session);
    const instances: T[] = [];

    const records = await this.scanItems(recordClass.type);

    records.forEach((value) => {
      instances.push(deserializeRecord(value, recordClass));
    });

    return instances;
  }

  async findAllByQuery(
    query: Query<BasicRecord>,
    recordClass: BaseRecordConstructor<T>
  ): Promise<T[]> {
    this.checkSession(this.session);

    const instances: T[] = [];

    const records = await this.scanItems(recordClass.type, query);
    records.forEach((value) => {
      instances.push(deserializeRecord(value, recordClass));
    });
    return instances;
  }

  async getItem(id: string): Promise<StorageRecord | undefined> {
    const qValues = await this.session.query(SqliteStorage.GET_ITEM_SQL, [id]);
    if (qValues && qValues.values && qValues.values.length === 1) {
      return {
        ...qValues.values[0],
        tags: resolveTagsFromDb(qValues.values[0].tags),
      } as StorageRecord;
    }
    return undefined;
  }

  async scanItems(type: string, query?: Query<T>): Promise<StorageRecord[]> {
    let scanValues = [type as string];
    let scanQuery = SqliteStorage.SCAN_QUERY_SQL;
    if (query && Object.keys(query).length > 0) {
      const dbQuery = convertDbQuery(query);
      const { condition, values } = this.getQueryConditionSql(dbQuery);
      scanQuery += " AND " + condition;
      scanValues = scanValues.concat(values);
    }
    const qValues = await this.session.query(scanQuery, scanValues);
    if (qValues && qValues.values && qValues.values.length > 0) {
      return qValues.values.map((record) => {
        return {
          ...record,
          tags: resolveTagsFromDb(record.tags),
        } as StorageRecord;
      });
    }
    return [];
  }

  async createItem(id: string, sObject: StorageRecord): Promise<void> {
    const transactionStatements = [];
    transactionStatements.push({
      statement: SqliteStorage.INSERT_ITEMS_SQL,
      values: [id, sObject.category, sObject.name, sObject.value],
    });
    transactionStatements.push(...this.getTagsInsertSql(id, sObject.tags));
    await this.session.executeSet(transactionStatements);
  }

  async updateItem(id: string, sObject: StorageRecord): Promise<void> {
    const transactionStatements = [];

    transactionStatements.push({
      statement: SqliteStorage.UPDATE_ITEMS_SQL,
      values: [sObject.category, sObject.name, sObject.value, id],
    });
    transactionStatements.push({
      statement: SqliteStorage.DELETE_ITEM_TAGS_SQL,
      values: [id],
    });
    transactionStatements.push(...this.getTagsInsertSql(id, sObject.tags));
    await this.session.executeSet(transactionStatements);
  }

  async deleteItem(id: string): Promise<void> {
    const transactionStatements = [
      {
        statement: SqliteStorage.DELETE_ITEM_SQL,
        values: [id],
      },
      {
        statement: SqliteStorage.DELETE_ITEM_TAGS_SQL,
        values: [id],
      },
    ];
    await this.session.executeSet(transactionStatements);
  }

  getTagsInsertSql(itemId: string, tags: Record<string, unknown>) {
    const statements = [];
    for (const key in tags) {
      if (isNil(tags[key])) continue;
      if (Array.isArray(tags[key])) {
        (tags[key] as Array<string>).forEach((value) => {
          if (!isNil(tags[key])) {
            statements.push({
              statement: SqliteStorage.INSERT_ITEM_TAG_SQL,
              values: [itemId, key, value, TagDataType.ARRAY],
            });
          }
        });
      } else if (typeof tags[key] == "boolean") {
        const value = tags[key] ? "1" : "0";
        statements.push({
          statement: SqliteStorage.INSERT_ITEM_TAG_SQL,
          values: [itemId, key, value, TagDataType.BOOLEAN],
        });
      } else {
        statements.push({
          statement: SqliteStorage.INSERT_ITEM_TAG_SQL,
          values: [itemId, key, tags[key], TagDataType.STRING],
        });
      }
    }
    return statements;
  }

  getQueryConditionSql(query: Query<BasicRecord>): {
    condition: string;
    values: string[];
  } {
    const conditions: string[] = [];
    let values: string[] = [];
    const dbQuery = convertDbQuery(query);

    for (const [queryKey, queryVal] of Object.entries(dbQuery)) {
      if (queryKey === "$or" || queryKey === "$and") {
        const orConditions: string[] = [];
        for (const query of queryVal as Array<Query<BasicRecord>>) {
          const orQuery = this.getQueryConditionSql(query);
          orConditions.push(orQuery.condition);
          values = values.concat(orQuery.values);
        }

        if (orConditions.length > 0) {
          conditions.push(
            orConditions
              .map((condition) => "(" + condition + ")")
              .join(queryKey === "$or" ? " OR " : " AND ")
          );
        }
      } else if (queryKey === "$not") {
        const notQuery = this.getQueryConditionSql(
          queryVal as Query<BasicRecord>
        );
        conditions.push("NOT (" + notQuery.condition + ")");
        values = values.concat(notQuery.values);
      } else if (Array.isArray(queryVal)) {
        const generateValueFinds = Array.from("?".repeat(queryVal.length));
        conditions.push(
          SqliteStorage.SCAN_TAGS_SQL_IN +
            "(" +
            generateValueFinds.join() +
            "))"
        );
        values.push(queryKey, ...queryVal);
      } else {
        if (isNil(queryVal)) {
          conditions.push(SqliteStorage.SCAN_TAGS_SQL_NOT_EXIST);
          values.push(queryKey);
        } else {
          conditions.push(SqliteStorage.SCAN_TAGS_SQL_EQ);
          values.push(queryKey, queryVal as string);
        }
      }
    }
    return { condition: conditions.join(" AND "), values };
  }

  private async checkSession(session?: SQLiteDBConnection) {
    if (!session || !(await session.isDBOpen())) {
      throw new Error(SqliteStorage.SESSION_IS_NOT_INITIALIZED);
    }
  }
}

export { SqliteStorage };
