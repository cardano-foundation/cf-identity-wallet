import {
  Query,
  StorageMessage,
  StorageService,
} from "../../storage/storage.types";
import {
  OperationPendingRecord,
  OperationPendingRecordStorageProps,
} from "./operationPendingRecord";
import { EventTypes, OperationAddedEvent } from "../event.types";
import { CoreEventEmitter } from "../event";

class OperationPendingStorage {
  private storageService: StorageService<OperationPendingRecord>;
  private eventEmitter: CoreEventEmitter;

  constructor(
    storageService: StorageService<OperationPendingRecord>,
    eventEmitter: CoreEventEmitter
  ) {
    this.storageService = storageService;
    this.eventEmitter = eventEmitter;
  }

  async save(
    props: OperationPendingRecordStorageProps
  ): Promise<OperationPendingRecord> {
    const record = new OperationPendingRecord(props);
    try {
      const pendingOperation = await this.storageService.save(record);
      this.eventEmitter.emit<OperationAddedEvent>({
        type: EventTypes.OperationAdded,
        payload: { operation: pendingOperation },
      });
      return pendingOperation;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          `${StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG} ${record.id}`
      ) {
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
