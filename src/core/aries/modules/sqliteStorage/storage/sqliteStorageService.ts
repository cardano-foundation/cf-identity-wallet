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
import { assertSqliteStorageWallet, deserializeRecord } from "./utils";
import { StorageObject } from "./sqliteStorageService.types";

class SqliteStorageService<T extends BaseRecord> implements StorageService<T> {
  static readonly RECORD_ALREADY_EXISTS_ERROR_MSG =
    "Record already exists with id";
  static readonly RECORD_DOES_NOT_EXIST_ERROR_MSG =
    "Record does not exist with id";

  async save(agentContext: AgentContext, record: T): Promise<void> {
    assertSqliteStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    record.updatedAt = new Date();

    const value = JsonTransformer.serialize(record);
    const tags = record.getTags() as Record<string, string>;

    if (await this.getKv(session, record.id)) {
      throw new RecordDuplicateError(
        `${SqliteStorageService.RECORD_ALREADY_EXISTS_ERROR_MSG} ${record.id}`,
        { recordType: record.type }
      );
    }

    await this.setKv(session, record.id, {
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
    if (!(await this.getKv(session, record.id))) {
      throw new RecordNotFoundError(
        `${SqliteStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`,
        { recordType: record.type }
      );
    }

    record.updatedAt = new Date();

    const value = JsonTransformer.serialize(record);
    const tags = record.getTags() as Record<string, string>;

    await this.updateKv(session, record.id, {
      category: record.type,
      name: record.id,
      value,
      tags,
    });
  }

  async delete(agentContext: AgentContext, record: T): Promise<void> {
    assertSqliteStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    if (!(await this.getKv(session, record.id))) {
      throw new RecordNotFoundError(
        `${SqliteStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`,
        { recordType: record.type }
      );
    }

    await this.removeKv(session, record.id);
  }

  async deleteById(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<void> {
    assertSqliteStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    if (!(await this.getKv(session, id))) {
      throw new RecordNotFoundError(
        `${SqliteStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${id}`,
        { recordType: recordClass.type }
      );
    }

    await this.removeKv(session, id);
  }

  async getById(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<T> {
    assertSqliteStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    // @TODO - foconnor: Missing check for recordClass type.
    const record = await this.getKv(session, id);

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

    const records = await this.getAllKv(session);

    records.forEach((value) => {
      if (value.category && value.category === recordClass.type) {
        instances.push(deserializeRecord(value, recordClass));
      }
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

    const records = await this.getAllKv(session);
    records.forEach((value) => {
      if (value.category && value.category === recordClass.type) {
        for (const [queryKey, queryVal] of Object.entries(query)) {
          if (value.tags[queryKey] !== queryVal && queryVal !== undefined) {
            return;
          }
        }
        instances.push(deserializeRecord(value, recordClass));
      }
    });
    return instances;
  }

  async removeKv(
    session: SQLiteDBConnection,
    id: string
  ): Promise<void> {
    const sqlcmd = `DELETE FROM kv WHERE key = "${id}"`;
    await session.execute(sqlcmd);
  }

  async getAllKv(
    session: SQLiteDBConnection
  ): Promise<StorageObject[]> {
    const sqlcmd = `SELECT * FROM kv`;
    const qValues = await session.query(sqlcmd);
    if (qValues && qValues.values && qValues.values.length > 0) {
      return qValues.values.map((record) => JSON.parse(record.value) as StorageObject);
    }
    return [];
  }

  async getKv(session: SQLiteDBConnection, key: string): Promise<StorageObject | undefined> {
    const stmt = `SELECT * FROM kv where key = "${key}"`;
    const qValues = await session.query(stmt);
    if (qValues && qValues.values && qValues.values.length === 1) {
      return JSON.parse(qValues.values[0]?.value);
    }
    return undefined;
  }

  async setKv(
    session: SQLiteDBConnection,
    key: string,
    val: StorageObject
  ): Promise<void> {
    const sqlcmd = "INSERT INTO kv (key,value) VALUES (?,?)";
    const values = [key, JSON.stringify(val)];
    await session.run(sqlcmd, values);
  }

  async updateKv(
    session: SQLiteDBConnection,
    key: string,
    val: StorageObject
  ): Promise<void> {
    const sqlcmd = "UPDATE kv set value = ? where key = ?";
    const values = [JSON.stringify(val), key];
    await session.run(sqlcmd, values);
  }
}

export { SqliteStorageService };
