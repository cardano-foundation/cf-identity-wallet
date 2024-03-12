import {
  BasicRecord,
  BasicStoragesApi,
  Query,
  SaveBasicRecordOption,
} from "../storage.types";

class SqliteStorage implements BasicStoragesApi {
  open(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  save({ content, tags, id }: SaveBasicRecordOption): Promise<BasicRecord> {
    throw new Error("Method not implemented.");
  }
  delete(record: BasicRecord): Promise<void> {
    throw new Error("Method not implemented.");
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
}

export { SqliteStorage };
