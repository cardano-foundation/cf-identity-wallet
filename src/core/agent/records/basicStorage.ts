import {
  Query,
  SaveBasicRecordOption,
  StorageApi,
  StorageMessage,
  StorageService,
} from "../../storage/storage.types";
import { BasicRecord } from "./basicRecord";

class BasicStorage implements StorageApi {
  private storageService: StorageService<BasicRecord>;
  static DUPLICATE_ID_ERROR = "Error: Record already exists with id";

  constructor(storageService: StorageService<BasicRecord>) {
    this.storageService = storageService;
  }

  async save({ content, tags, id }: SaveBasicRecordOption): Promise<BasicRecord> {
    const record = new BasicRecord({
      id,
      tags,
      content,
    });
    try {
      await this.storageService.save(record);
      return record;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === `${StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG} ${id}`
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

  delete(record: BasicRecord): Promise<void> {
    return this.storageService.delete(record);
  }
  deleteById(id: string): Promise<void> {
    return this.storageService.deleteById(id);
  }
  update(record: BasicRecord): Promise<void> {
    return this.storageService.update(record);
  }
  findById(id: string): Promise<BasicRecord | null> {
    return this.storageService.findById(id, BasicRecord);
  }
  findAllByQuery(query: Query<BasicRecord>): Promise<BasicRecord[]> {
    return this.storageService.findAllByQuery(query, BasicRecord);
  }
  getAll(): Promise<BasicRecord[]> {
    return this.storageService.getAll(BasicRecord);
  }
  async createOrUpdateBasicRecord(record: BasicRecord): Promise<void> {
    try {
      await this.update(record);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          `${StorageMessage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`
      ) {
        await this.save(record);
      } else {
        throw error;
      }
    }
  }
}

export { BasicStorage };
