import { Query, StorageMessage, StorageService } from "../../storage/storage.types";
import {
  OperationPendingRecord,
  OperationPendingRecordStorageProps,
} from "./operationPendingRecord";

class OperationPendingStorage {
  private storageService: StorageService<OperationPendingRecord>;

  constructor(storageService: StorageService<OperationPendingRecord>) {
    this.storageService = storageService;
  }

  async save(
    props: OperationPendingRecordStorageProps
  ): Promise<OperationPendingRecord> {
    const record = new OperationPendingRecord(props);
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

  delete(record: OperationPendingRecord): Promise<void> {
    return this.storageService.delete(record);
  }
  deleteById(id: string): Promise<void> {
    return this.storageService.deleteById(id);
  }
  update(record: OperationPendingRecord): Promise<void> {
    return this.storageService.update(record);
  }
  findById(id: string): Promise<OperationPendingRecord | null> {
    return this.storageService.findById(id, OperationPendingRecord);
  }
  findAllByQuery(
    query: Query<OperationPendingRecord>
  ): Promise<OperationPendingRecord[]> {
    return this.storageService.findAllByQuery(query, OperationPendingRecord);
  }
  getAll(): Promise<OperationPendingRecord[]> {
    return this.storageService.getAll(OperationPendingRecord);
  }
}

export { OperationPendingStorage };
