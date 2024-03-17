import { BasicRecord, StorageRecord, TagsBase } from "./storage.types";

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
  });
  record.replaceTags(storageRecord.tags as TagsBase);
  return record;
}

export { deserializeRecord };
