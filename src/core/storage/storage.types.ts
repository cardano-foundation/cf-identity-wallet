import { v4 as uuidv4 } from "uuid";
import { instanceToPlain, instanceToInstance } from "class-transformer";
import { BaseRecord } from "@aries-framework/core";

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

type MetadataValue = Record<string, any>;

export type MetadataBase = {
  [key: string]: MetadataValue;
};

class Metadata<MetadataTypes> {
  public readonly data: MetadataBase;

  public constructor(data: MetadataBase) {
    this.data = data;
  }

  /**
   * Gets the value by key in the metadata
   *
   * Any extension of the `BaseRecord` can implement their own typed metadata
   *
   * @param key the key to retrieve the metadata by
   * @returns the value saved in the key value pair
   * @returns null when the key could not be found
   */
  public get<Value extends MetadataValue, Key extends string = string>(
    key: Key
  ): (Key extends keyof MetadataTypes ? MetadataTypes[Key] : Value) | null {
    return (
      (this.data[key] as Key extends keyof MetadataTypes
        ? MetadataTypes[Key]
        : Value) ?? null
    );
  }

  /**
   * Will set, or override, a key-value pair on the metadata
   *
   * @param key the key to set the metadata by
   * @param value the value to set in the metadata
   */
  public set<Value extends MetadataValue, Key extends string = string>(
    key: Key,
    value: Key extends keyof MetadataTypes ? MetadataTypes[Key] : Value
  ): void {
    this.data[key] = value as MetadataValue;
  }

  /**
   * Adds a record to a metadata key
   *
   * @param key the key to add the metadata at
   * @param value the value to add in the metadata
   */
  public add<Value extends MetadataValue, Key extends string = string>(
    key: Key,
    value: Partial<Key extends keyof MetadataTypes ? MetadataTypes[Key] : Value>
  ): void {
    this.data[key] = {
      ...this.data[key],
      ...value,
    };
  }

  /**
   * Retrieves all the metadata for a record
   *
   * @returns all the metadata that exists on the record
   */
  public get keys(): string[] {
    return Object.keys(this.data);
  }

  /**
   * Will delete the key value pair in the metadata
   *
   * @param key the key to delete the data by
   */
  public delete<Key extends string = string>(key: Key): void {
    delete this.data[key];
  }
}

// abstract class BaseRecord<
//   DefaultTags extends TagsBase = TagsBase,
//   CustomTags extends TagsBase = TagsBase,
//   MetadataValues = {}
// > {
//   protected _tags: CustomTags = {} as CustomTags;

//   public id!: string;

//   public createdAt!: Date;

//   public updatedAt?: Date;

//   public readonly type = BaseRecord.type;
//   public static readonly type: string = "BaseRecord";

//   public metadata: Metadata<MetadataValues> = new Metadata({});

//   public abstract getTags(): Tags<DefaultTags, CustomTags>;

//   public setTag(name: keyof CustomTags, value: CustomTags[keyof CustomTags]) {
//     this._tags[name] = value;
//   }

//   public getTag(name: keyof CustomTags | keyof DefaultTags) {
//     return this.getTags()[name];
//   }

//   public setTags(tags: Partial<CustomTags>) {
//     this._tags = {
//       ...this._tags,
//       ...tags,
//     };
//   }

//   public replaceTags(tags: CustomTags & Partial<DefaultTags>) {
//     this._tags = tags;
//   }

//   public toJSON(): Record<string, unknown> {
//     return instanceToPlain(this, {
//       exposeDefaultValues: true,
//     });
//   }

//   public clone() {
//     return instanceToInstance(this, {
//       exposeDefaultValues: true,
//       enableCircularCheck: true,
//       enableImplicitConversion: true,
//       ignoreDecorators: true,
//     });
//   }
// }

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

export type SimpleQuery<T extends BaseRecord<any, any, any>> = Partial<
  ReturnType<T["getTags"]>
> &
  TagsBase;
interface AdvancedQuery<T extends BaseRecord> {
  $and?: Query<T>[];
  $or?: Query<T>[];
  $not?: Query<T>;
}
type Query<T extends BaseRecord<any, any, any>> =
  | AdvancedQuery<T>
  | SimpleQuery<T>;

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
