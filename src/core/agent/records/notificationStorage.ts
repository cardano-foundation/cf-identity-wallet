import {
  Query,
  StorageMessage,
  StorageService,
} from "../../storage/storage.types";
import {
  NotificationRecord,
  NotificationRecordStorageProps,
} from "./notificationRecord";

class NotificationStorage {
  private storageService: StorageService<NotificationRecord>;

  constructor(storageService: StorageService<NotificationRecord>) {
    this.storageService = storageService;
  }

  save(props: NotificationRecordStorageProps): Promise<NotificationRecord> {
    const record = new NotificationRecord(props);
    return this.storageService.save(record);
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
  async findExpectedById(id: string): Promise<NotificationRecord> {
    const record = await this.findById(id);
    if (!record) {
      throw new Error(StorageMessage.RECORD_DOES_NOT_EXIST_ERROR_MSG);
    }
    return record;
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
