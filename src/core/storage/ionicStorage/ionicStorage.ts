import { Storage, Drivers } from "@ionic/storage";
import {
  BasicRecord,
  BasicStoragesApi,
  Query,
  SaveBasicRecordOption,
} from "../storage.types";
import { deserializeRecord } from "../utils";

class IonicStorage implements BasicStoragesApi {
  private static readonly drivers = [Drivers.IndexedDB];
  private static readonly SESION_IS_NOT_INITIALIZED =
    "Session is not initialized";

  static readonly RECORD_ALREADY_EXISTS_ERROR_MSG =
    "Record already exists with id";

  static readonly RECORD_DOES_NOT_EXIST_ERROR_MSG =
    "Record does not exist with id";
  private session?: Storage;

  async open(storageName: string) {
    if (!this.session) {
      this.session = new Storage({
        name: storageName,
        driverOrder: IonicStorage.drivers,
      });
      await this.session.create();
    }
  }

  async save({
    content,
    tags,
    id,
  }: SaveBasicRecordOption): Promise<BasicRecord> {
    this.checkSession(this.session);
    const record = new BasicRecord({
      id,
      content,
      tags,
    });
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

  async delete(record: BasicRecord): Promise<void> {
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

  async update(record: BasicRecord): Promise<void> {
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

  async findById(id: string): Promise<BasicRecord> {
    this.checkSession(this.session);
    const recordStorage = await this.session!.get(id);

    if (!recordStorage) {
      throw new Error(`${IonicStorage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${id}`);
    }
    return deserializeRecord(recordStorage);
  }
  async findAllByQuery(query: Query<BasicRecord>): Promise<BasicRecord[]> {
    this.checkSession(this.session);
    const instances: BasicRecord[] = [];

    await this.session!.forEach((record) => {
      if (
        record.category &&
        record.category === BasicRecord.type &&
        this.checkRecordIsValidWithQuery(record, query)
      ) {
        instances.push(deserializeRecord(record));
      }
    });

    return instances;
  }

  async getAll(): Promise<BasicRecord[]> {
    this.checkSession(this.session);
    const instances: BasicRecord[] = [];
    await this.session!.forEach((value) => {
      if (value.category && value.category === BasicRecord.type) {
        instances.push(deserializeRecord(value));
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
        } else if (
          record.tags[queryKey] !== queryVal &&
          queryVal !== undefined
        ) {
          return false;
        }
      }
    }
    return true;
  }
}

export { IonicStorage };
