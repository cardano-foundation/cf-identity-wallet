import { Query, StorageMessage, StorageService } from "../../storage/storage.types";
import {
  NotificationRecord,
  NotificationRecordStorageProps,
} from "./notificationRecord";

class NotificationStorage {
  private storageService: StorageService<NotificationRecord>;

  constructor(storageService: StorageService<NotificationRecord>) {
    this.storageService = storageService;
  }

  async save(props: NotificationRecordStorageProps): Promise<NotificationRecord> {
    const record = new NotificationRecord(props);
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

  delete(record: NotificationRecord): Promise<void> {
    return this.storageService.delete(record);
  }
  deleteById(id: string): Promise<void> {
    return this.storageService.deleteById(id);
  }
  update(record: NotificationRecord): Promise<void> {
    return this.storageService.update(record);
  }
  findById(id: string): Promise<NotificationRecord | null> {
    return this.storageService.findById(id, NotificationRecord);
  }
  findAllByQuery(
    query: Query<NotificationRecord>
  ): Promise<NotificationRecord[]> {
    return this.storageService.findAllByQuery(query, NotificationRecord);
  }
  getAll(): Promise<NotificationRecord[]> {
    return this.storageService.getAll(NotificationRecord);
  }
}

export { NotificationStorage };
