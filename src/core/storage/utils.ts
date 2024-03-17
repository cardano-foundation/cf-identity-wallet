import { BasicRecord, StorageRecord, TagsBase } from "./storage.types";

function deserializeRecord(storageRecord: StorageRecord): BasicRecord {
  const parsedValue = JSON.parse(storageRecord.value);
  const record = new BasicRecord({
    ...parsedValue,
    id: storageRecord.name,
    tags: parsedValue._tags,
  });
  record.replaceTags(storageRecord.tags as TagsBase);
  return record;
}

export { deserializeRecord };
