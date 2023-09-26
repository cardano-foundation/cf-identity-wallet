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
import { assertIonicStorageWallet, deserializeRecord } from "./utils";

class IonicStorageService<T extends BaseRecord> implements StorageService<T> {
  static readonly RECORD_ALREADY_EXISTS_ERROR_MSG =
    "Record already exists with id";
  static readonly RECORD_DOES_NOT_EXIST_ERROR_MSG =
    "Record does not exist with id";

  async save(agentContext: AgentContext, record: T): Promise<void> {
    assertIonicStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    record.updatedAt = new Date();

    const value = JsonTransformer.serialize(record);
    const tags = record.getTags() as Record<string, string>;

    if (await session.get(record.id)) {
      throw new RecordDuplicateError(
        `${IonicStorageService.RECORD_ALREADY_EXISTS_ERROR_MSG} ${record.id}`,
        { recordType: record.type }
      );
    }

    await session.set(record.id, {
      category: record.type,
      name: record.id,
      value,
      tags,
    });
  }

  async update(agentContext: AgentContext, record: T): Promise<void> {
    assertIonicStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    // @TODO - foconnor: We should wrap get to enforce type here.
    if (!(await session.get(record.id))) {
      throw new RecordNotFoundError(
        `${IonicStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`,
        { recordType: record.type }
      );
    }

    record.updatedAt = new Date();

    const value = JsonTransformer.serialize(record);
    const tags = record.getTags() as Record<string, string>;

    await session.set(record.id, {
      category: record.type,
      name: record.id,
      value,
      tags,
    });
  }

  async delete(agentContext: AgentContext, record: T): Promise<void> {
    assertIonicStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    if (!(await session.get(record.id))) {
      throw new RecordNotFoundError(
        `${IonicStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`,
        { recordType: record.type }
      );
    }

    await session.remove(record.id);
  }

  async deleteById(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<void> {
    assertIonicStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    if (!(await session.get(id))) {
      throw new RecordNotFoundError(
        `${IonicStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${id}`,
        { recordType: recordClass.type }
      );
    }

    await session.remove(id);
  }

  async getById(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<T> {
    assertIonicStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;

    // @TODO - foconnor: Missing check for recordClass type.
    const record = await session.get(id);

    if (!record) {
      throw new RecordNotFoundError(
        `${IonicStorageService.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${id}`,
        { recordType: recordClass.type }
      );
    }
    return deserializeRecord(record, recordClass);
  }

  async getAll(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>
  ): Promise<T[]> {
    assertIonicStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;
    const instances: T[] = [];

    await session.forEach((value) => {
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
    assertIonicStorageWallet(agentContext.wallet);
    const session = agentContext.wallet.store;
    const instances: T[] = [];

    // Right now we just support SimpleQuery and not AdvancedQuery as it's not something we need right now.
    // This is also really inefficient but OK for now.
    await session.forEach((record) => {
      if (record.category && record.category === recordClass.type) {
        for (const [queryKey, queryVal] of Object.entries(query)) {
          // @TODO: That is temporary. Need to look at the whole and handle this function appropriately
          if (Array.isArray(queryVal) && queryVal.length > 0) {
            // compare them item by item
            const check = queryVal.every((element) =>
              record.tags?.[queryKey]?.includes(element)
            );
            if (!check) {
              return;
            }
            continue;
          }
          if (record.tags[queryKey] !== queryVal && queryVal !== undefined) {
            return;
          }
        }
        instances.push(deserializeRecord(record, recordClass));
      }
    });
    return instances;
  }
}

export { IonicStorageService };
