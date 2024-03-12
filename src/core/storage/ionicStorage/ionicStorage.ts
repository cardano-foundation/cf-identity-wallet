import { Storage, Drivers } from "@ionic/storage";
import {
  BasicRecord,
  BasicStoragesApi,
  Query,
  SaveBasicRecordOption,
} from "../storage.types";


class IonicStorage implements BasicStoragesApi {
  private static readonly drivers = [Drivers.IndexedDB];
  private static readonly SESION_IS_NOT_INITIALIZED =
    "Session is not initialized";

  private static readonly RECORD_ALREADY_EXISTS_ERROR_MSG =
    "Record already exists with id";

  private static readonly RECORD_DOES_NOT_EXIST_ERROR_MSG =
    "Record does not exist with id";
  private session?: Storage;

  async open() {
    if (!this.session) {
      this.session = new Storage({
        name: "IonicStorageBasicRecord",
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
      value: JSON.stringify(content),
      tags,
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
  deleteById(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  update(record: BasicRecord): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findById(id: string): Promise<BasicRecord | null> {
    throw new Error("Method not implemented.");
  }
  findAllByQuery(query: Query<BasicRecord>): Promise<BasicRecord[]> {
    throw new Error("Method not implemented.");
  }
  getAll(): Promise<BasicRecord[]> {
    throw new Error("Method not implemented.");
  }

  private checkSession(session?: Storage) {
    if (!session) {
      throw new Error(IonicStorage.SESION_IS_NOT_INITIALIZED);
    }
  }
}

export { IonicStorage };
