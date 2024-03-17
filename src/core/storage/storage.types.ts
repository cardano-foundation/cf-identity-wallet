import { v4 as uuidv4 } from "uuid";
import { instanceToPlain, instanceToInstance } from "class-transformer";

export type TagValue = string | boolean | undefined | Array<string> | null;
export type TagsBase = {
  [key: string]: TagValue;
  [key: number]: never;
};

export type Tags<
  DefaultTags extends TagsBase,
  CustomTags extends TagsBase
> = CustomTags & DefaultTags;

export type RecordTags<Record extends BaseRecord> = ReturnType<
  Record["getTags"]
>;

export type BaseRecordAny = BaseRecord<any, any>;

abstract class BaseRecord<
  DefaultTags extends TagsBase = TagsBase,
  CustomTags extends TagsBase = TagsBase
> {
  protected _tags: CustomTags = {} as CustomTags;

  public id!: string;

  public createdAt!: Date;

  public updatedAt?: Date;

  public readonly type = BaseRecord.type;
  public static readonly type: string = "BaseRecord";

  public abstract getTags(): Tags<DefaultTags, CustomTags>;

  public setTag(name: keyof CustomTags, value: CustomTags[keyof CustomTags]) {
    this._tags[name] = value;
  }

  public getTag(name: keyof CustomTags | keyof DefaultTags) {
    return this.getTags()[name];
  }

  public setTags(tags: Partial<CustomTags>) {
    this._tags = {
      ...this._tags,
      ...tags,
    };
  }

  public replaceTags(tags: CustomTags & Partial<DefaultTags>) {
    this._tags = tags;
  }

  public toJSON(): Record<string, unknown> {
    return instanceToPlain(this, {
      exposeDefaultValues: true,
    });
  }

  public clone() {
    return instanceToInstance(this, {
      exposeDefaultValues: true,
      enableCircularCheck: true,
      enableImplicitConversion: true,
      ignoreDecorators: true,
    });
  }
}

type GenericRecordTags = TagsBase;
interface BasicRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: GenericRecordTags;
  content: Record<string, unknown>;
}
interface SaveBasicRecordOption {
  content: Record<string, unknown>;
  id?: string;
  tags?: GenericRecordTags;
}

class BasicRecord extends BaseRecord<GenericRecordTags> {
  public content!: Record<string, unknown>;

  public static readonly type = "GenericRecord";
  public readonly type = BasicRecord.type;

  public constructor(props: BasicRecordStorageProps) {
    super();

    if (props) {
      this.id = props.id ?? uuidv4();
      this.createdAt = props.createdAt ?? new Date();
      this.content = props.content;
      this._tags = props.tags ?? {};
    }
  }

  public getTags() {
    return {
      ...this._tags,
    };
  }
}

export type SimpleQuery<T extends BaseRecord<any, any>> = Partial<
  ReturnType<T["getTags"]>
> &
  TagsBase;
interface AdvancedQuery<T extends BaseRecord> {
  $and?: Query<T>[];
  $or?: Query<T>[];
  $not?: Query<T>;
}
type Query<T extends BaseRecord<any, any>> = AdvancedQuery<T> | SimpleQuery<T>;

interface BasicStoragesApi {
  open(storageName: string): Promise<void>;
  save({ content, tags, id }: SaveBasicRecordOption): Promise<BasicRecord>;
  delete(record: BasicRecord): Promise<void>;
  deleteById(id: string): Promise<void>;
  update(record: BasicRecord): Promise<void>;
  findById(id: string): Promise<BasicRecord | null>;
  findAllByQuery(query: Query<BasicRecord>): Promise<BasicRecord[]>;
  getAll(): Promise<BasicRecord[]>;
}
interface StorageRecord {
  name: string;
  value: string;
  tags: Record<string, unknown>;
  category: string;
}

export { BasicRecord, BaseRecord };
export type { BasicStoragesApi, Query, SaveBasicRecordOption, StorageRecord };
