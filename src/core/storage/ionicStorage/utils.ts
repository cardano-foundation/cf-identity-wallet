import { BasicRecord, StorageRecord } from "../storage.types";

function deserializeRecord(storageRecord: StorageRecord): BasicRecord {
  const parsedValue = JSON.parse(storageRecord.value);
  return new BasicRecord({
    id: storageRecord.name,
    content: parsedValue.content,
    tags: parsedValue._tags,
  });
}

export { deserializeRecord };
