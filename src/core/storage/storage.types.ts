import { v4 as uuidv4 } from "uuid";

export type TagsBase = Record<string | number, unknown>;

export type RecordTags<Record extends BaseRecord> = ReturnType<
  Record["getTags"]
>;

abstract class BaseRecord {
  protected _tags: TagsBase = {} as TagsBase;

  id!: string;

  createdAt!: Date;

  updatedAt?: Date;

  abstract getTags(): TagsBase;

  setTag(name: keyof TagsBase, value: TagsBase[keyof TagsBase]) {
    this._tags[name] = value;
  }

  getTag(name: keyof TagsBase | keyof TagsBase) {
    return this.getTags()[name];
  }

  setTags(tags: Partial<TagsBase>) {
    this._tags = {
      ...this._tags,
      ...tags,
    };
  }

  public replaceTags(tags: TagsBase & Partial<TagsBase>) {
    this._tags = tags;
  }
}

type GenericRecordTags = TagsBase;
interface BasicRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: GenericRecordTags;
  content: Record<string, unknown>;
  type: RecordType;
}
interface SaveBasicRecordOption {
  content: Record<string, unknown>;
  id?: string;
  tags?: GenericRecordTags;
  type: RecordType;
}

enum RecordType {
  CONNECTION_NOTE = "ConnectionNote",
  CONNECTION_KERI_METADATA = "ConnectionKeriMetadata",
  NOTIFICATION_KERI = "NotificationKeri",
}

class BasicRecord extends BaseRecord {
  content!: Record<string, unknown>;
  type!: RecordType;

  constructor(props: BasicRecordStorageProps) {
    super();

    if (props) {
      this.id = props.id ?? uuidv4();
      this.createdAt = props.createdAt ?? new Date();
      this.content = props.content;
      this._tags = props.tags ?? {};
      this.type = props.type;
    }
  }

  getTags() {
    return {
      ...this._tags,
    };
  }
}

export type SimpleQuery<T extends BaseRecord> = Partial<
  ReturnType<T["getTags"]>
> &
  TagsBase;
interface AdvancedQuery<T extends BaseRecord> {
  $and?: Query<T>[];
  $or?: Query<T>[];
  $not?: Query<T>;
}
type Query<T extends BaseRecord> = AdvancedQuery<T> | SimpleQuery<T>;

interface StorageApi {
  open(storageName: string): Promise<void>;
  save({ content, tags, id }: SaveBasicRecordOption): Promise<BasicRecord>;
  delete(record: BasicRecord): Promise<void>;
  deleteById(id: string): Promise<void>;
  update(record: BasicRecord): Promise<void>;
  findById(id: string): Promise<BasicRecord | null>;
  findAllByQuery(
    type: RecordType,
    query: Query<BasicRecord>
  ): Promise<BasicRecord[]>;
  getAll(type: RecordType): Promise<BasicRecord[]>;
}
interface StorageRecord {
  name: string;
  value: string;
  tags: Record<string, unknown>;
  category: string;
}

export { BasicRecord, BaseRecord, RecordType };
export type { StorageApi, Query, SaveBasicRecordOption, StorageRecord };
