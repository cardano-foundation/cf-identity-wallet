import {
  Query,
  SaveBasicRecordOption,
  StorageApi,
  StorageService,
} from "../../storage/storage.types";
import { BasicRecord } from "./basicRecord";

class BasicStorage implements StorageApi {
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
}

export { BasicStorage };
