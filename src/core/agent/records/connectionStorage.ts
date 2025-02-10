import { Query, StorageService } from "../../storage/storage.types";
import {
  ConnectionRecord,
  ConnectionRecordStorageProps,
} from "./connectionRecord";

class ConnectionStorage {
  private storageService: StorageService<ConnectionRecord>;

  constructor(storageService: StorageService<ConnectionRecord>) {
    this.storageService = storageService;
  }

  save(props: ConnectionRecordStorageProps): Promise<ConnectionRecord> {
    const record = new ConnectionRecord(props);
    return this.storageService.save(record);
  }
  delete(record: ConnectionRecord): Promise<void> {
    return this.storageService.delete(record);
  }
  deleteById(id: string): Promise<void> {
    return this.storageService.deleteById(id);
  }
  update(record: ConnectionRecord): Promise<void> {
    return this.storageService.update(record);
  }
  findById(id: string): Promise<ConnectionRecord | null> {
    return this.storageService.findById(id, ConnectionRecord);
  }
  findAllByQuery(query: Query<ConnectionRecord>): Promise<ConnectionRecord[]> {
    return this.storageService.findAllByQuery(query, ConnectionRecord);
  }
  getAll(): Promise<ConnectionRecord[]> {
    return this.storageService.getAll(ConnectionRecord);
  }
}

export { ConnectionStorage };
