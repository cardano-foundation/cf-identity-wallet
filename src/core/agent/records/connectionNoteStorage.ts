import { Query, StorageService } from "../../storage/storage.types";
import {
  ConnectionNoteRecord,
  ConnectionNoteRecordStorageProps,
} from "./connectionNoteRecord";

class ConnectionNoteStorage {
  private storageService: StorageService<ConnectionNoteRecord>;

  constructor(storageService: StorageService<ConnectionNoteRecord>) {
    this.storageService = storageService;
  }

  save(props: ConnectionNoteRecordStorageProps): Promise<ConnectionNoteRecord> {
    const record = new ConnectionNoteRecord(props);
    return this.storageService.save(record);
  }
  delete(record: ConnectionNoteRecord): Promise<void> {
    return this.storageService.delete(record);
  }
  deleteById(id: string): Promise<void> {
    return this.storageService.deleteById(id);
  }
  update(record: ConnectionNoteRecord): Promise<void> {
    return this.storageService.update(record);
  }
  findById(id: string): Promise<ConnectionNoteRecord | null> {
    return this.storageService.findById(id, ConnectionNoteRecord);
  }
  findAllByQuery(
    query: Query<ConnectionNoteRecord>
  ): Promise<ConnectionNoteRecord[]> {
    return this.storageService.findAllByQuery(query, ConnectionNoteRecord);
  }
  getAll(): Promise<ConnectionNoteRecord[]> {
    return this.storageService.getAll(ConnectionNoteRecord);
  }
}

export { ConnectionNoteStorage };
