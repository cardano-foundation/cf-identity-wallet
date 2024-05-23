import {
  Query,
  SaveBasicRecordOption,
  StorageApi,
  StorageService,
} from "../../storage/storage.types";
import { BasicRecord } from "./basicRecord";

class BasicStorage implements StorageApi {
  static readonly RECORD_DOES_NOT_EXIST_ERROR_MSG =
    "Record does not exist with id";

  private storageService: StorageService<BasicRecord>;

  constructor(storageService: StorageService<BasicRecord>) {
    this.storageService = storageService;
  }

  save({ content, tags, id }: SaveBasicRecordOption): Promise<BasicRecord> {
    const record = new BasicRecord({
      id,
      tags,
      content,
    });
    return this.storageService.save(record);
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
          `${BasicStorage.RECORD_DOES_NOT_EXIST_ERROR_MSG} ${record.id}`
      ) {
        await this.save(record);
      } else {
        throw error;
      }
    }
  }
}

export { BasicStorage };
