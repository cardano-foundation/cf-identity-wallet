import { plainToInstance } from "class-transformer";
import {
  BaseRecord,
  BaseRecordConstructor,
  StorageRecord,
  Tags,
} from "./storage.types";

function deserializeRecord<T extends BaseRecord>(
  storageRecord: StorageRecord,
  recordClass: BaseRecordConstructor<T>
): T {
  const parsedValue = JSON.parse(storageRecord.value);
  const instance = plainToInstance(recordClass, parsedValue, {
    exposeDefaultValues: true,
  });
  instance.replaceTags(storageRecord.tags as Tags);
  instance.createdAt = new Date(instance.createdAt);
  if (instance.updatedAt) instance.updatedAt = new Date(instance.updatedAt);

  return instance;
}

export { deserializeRecord };
