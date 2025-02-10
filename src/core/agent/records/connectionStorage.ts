import { Query, StorageMessage, StorageService } from "../../storage/storage.types";
import {
  ConnectionRecord,
  ConnectionRecordStorageProps,
} from "./connectionRecord";

class ConnectionStorage {
  private storageService: StorageService<ConnectionRecord>;

  constructor(storageService: StorageService<ConnectionRecord>) {
    this.storageService = storageService;
  }

  async save(props: ConnectionRecordStorageProps): Promise<ConnectionRecord> {
    const record = new ConnectionRecord(props);
    try {
      await this.storageService.save(record);
      return record;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === `${StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG} ${record.id}`
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          `Duplicate record detected for ID: ${record.id}. Ignoring...`
        );
        return record;
      } else {
        throw error;
      }
    }
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
