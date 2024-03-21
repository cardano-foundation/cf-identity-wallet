import { BasicRecord, StorageRecord, Tags } from "./storage.types";

function deserializeRecord(storageRecord: StorageRecord): BasicRecord {
  const parsedValue = JSON.parse(storageRecord.value);
  const record = new BasicRecord({
    ...parsedValue,
    id: storageRecord.name,
    tags: parsedValue._tags,
    createdAt: new Date(parsedValue.createdAt),
    ...(parsedValue.updatedAt ?? {
      updatedAt: new Date(parsedValue.updatedAt),
    }),
    type: storageRecord.category,
  });
  record.replaceTags(storageRecord.tags as Tags);
  return record;
}

export { deserializeRecord };
