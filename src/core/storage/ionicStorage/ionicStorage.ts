import { Storage, Drivers } from "@ionic/storage";
import {
  Query,
  BaseRecord,
  StorageService,
  BaseRecordConstructor,
} from "../storage.types";
import { deserializeRecord } from "../utils";
import { BasicRecord } from "../../agent/records";

class IonicStorage<T extends BaseRecord> implements StorageService<T> {
  private static readonly SESION_IS_NOT_INITIALIZED =
    "Session is not initialized";

  static readonly RECORD_ALREADY_EXISTS_ERROR_MSG =
    "Record already exists with id";

  static readonly RECORD_DOES_NOT_EXIST_ERROR_MSG =
    "Record does not exist with id";
  private session?: Storage;

  constructor(session: Storage) {
    this.session = session;
  }

  async save(record: T): Promise<T> {
    this.checkSession(this.session);
    record.updatedAt = new Date();
    if (await this.session!.get(record.id)) {
      throw new Error(
        `${IonicStorage.RECORD_ALREADY_EXISTS_ERROR_MSG} ${record.id}`
      );
    }
    await this.session!.set(record.id, {
      category: record.type,
      name: record.id,
      value: JSON.stringify(record),
      tags: record.getTags(),
    });
    return record;
  }

  async delete(record: T): Promise<void> {
    this.checkSession(this.session);
    if (!(await this.session!.get(record.id))) {
      throw new Error(
        `${IonicStorage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`
      );
    }

    await this.session!.remove(record.id);
  }

  async deleteById(id: string): Promise<void> {
    this.checkSession(this.session);
    if (!(await this.session!.get(id))) {
      throw new Error(`${IonicStorage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${id}`);
    }

    await this.session!.remove(id);
  }

  async update(record: T): Promise<void> {
    this.checkSession(this.session);
    if (!(await this.session!.get(record.id))) {
      throw new Error(
        `${IonicStorage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`
      );
    }

    record.updatedAt = new Date();

    const tags = record.getTags();

    await this.session!.set(record.id, {
      category: record.type,
      name: record.id,
      value: JSON.stringify(record),
      tags,
    });
  }

  async findById(
    id: string,
    recordClass: BaseRecordConstructor<T>
  ): Promise<T | null> {
    this.checkSession(this.session);
    const recordStorage = await this.session!.get(id);

    if (!recordStorage) {
      return null;
    }
    return deserializeRecord(recordStorage, recordClass);
  }

  async findAllByQuery(
    query: Query<T>,
    recordClass: BaseRecordConstructor<T>
  ): Promise<T[]> {
    this.checkSession(this.session);
    const instances: T[] = [];

    await this.session!.forEach((record) => {
      if (
        record.category &&
        record.category === recordClass.type &&
        this.checkRecordIsValidWithQuery(record, query)
      ) {
        instances.push(deserializeRecord(record, recordClass));
      }
    });

    return instances;
  }

  async getAll(recordClass: BaseRecordConstructor<T>): Promise<T[]> {
    this.checkSession(this.session);
    const instances: T[] = [];
    await this.session!.forEach((value) => {
      if (value.category && value.category === recordClass.type) {
        instances.push(deserializeRecord(value, recordClass));
      }
    });

    return instances;
  }

  private checkSession(session?: Storage) {
    if (!session) {
      throw new Error(IonicStorage.SESION_IS_NOT_INITIALIZED);
    }
  }

  private checkRecordIsValidWithQuery(
    record: any,
    query: Query<BasicRecord>
  ): boolean {
    for (const [queryKey, queryVal] of Object.entries(query)) {
      if (queryKey === "$and") {
        if (
          !queryVal.every((query: Query<BasicRecord>) =>
            this.checkRecordIsValidWithQuery(record, query)
          )
        ) {
          return false;
        }
      } else if (queryKey === "$or") {
        if (
          !queryVal.some((query: Query<BasicRecord>) =>
            this.checkRecordIsValidWithQuery(record, query)
          )
        ) {
          return false;
        }
      } else if (queryKey === "$not") {
        if (this.checkRecordIsValidWithQuery(record, queryVal)) {
          return false;
        }
      } else {
        if (Array.isArray(queryVal) && queryVal.length > 0) {
          // compare them item by item
          const check = queryVal.every((element) =>
            record.tags?.[queryKey]?.includes(element)
          );
          if (!check) {
            return false;
          }
        } else if (record.tags[queryKey] !== queryVal) {
          return false;
        }
      }
    }
    return true;
  }
}

export { IonicStorage };
