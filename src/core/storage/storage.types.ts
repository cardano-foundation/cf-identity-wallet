import { instanceToPlain } from "class-transformer";
import { BasicRecord } from "../agent/records";

type Tags = Record<string | number, unknown>;
abstract class BaseRecord {
  protected _tags: Tags = {} as Tags;

  id!: string;

  type!: string;

  createdAt!: Date;

  updatedAt?: Date;

  abstract getTags(): Tags;

  setTag(name: keyof Tags, value: Tags[keyof Tags]) {
    this._tags[name] = value;
  }

  getTag(name: keyof Tags | keyof Tags) {
    return this.getTags()[name];
  }

  setTags(tags: Partial<Tags>) {
    this._tags = {
      ...this._tags,
      ...tags,
    };
  }

  replaceTags(tags: Tags & Partial<Tags>) {
    this._tags = tags;
  }

  toJSON(): Record<string, unknown> {
    return instanceToPlain(this, {
      exposeDefaultValues: true,
    });
  }
}

interface SaveBasicRecordOption {
  content: Record<string, unknown>;
  id?: string;
  tags?: Tags;
}

enum RecordType {
  CONNECTION_NOTE = "ConnectionNote",
  KERIA_CONNECTION_METADATA = "KeriaConnectionMetadata",
  KERIA_NOTIFICATION = "KeriaNotification",
  CREDENTIAL_METADATA_RECORD = "CredentialMetadataRecord",
  IDENTIFIER_METADATA_RECORD = "IdentifierMetadataRecord",
  OP_PASS_HINT = "OpPassHint",
}

type SimpleQuery<T extends BaseRecord> = Partial<ReturnType<T["getTags"]>> &
  Tags;
interface AdvancedQuery<T extends BaseRecord> {
  $and?: Query<T>[];
  $or?: Query<T>[];
  $not?: Query<T>;
}
type Query<T extends BaseRecord> = AdvancedQuery<T> | SimpleQuery<T>;

interface StorageApi {
  save({ content, tags, id }: SaveBasicRecordOption): Promise<BasicRecord>;
  delete(record: BasicRecord): Promise<void>;
  deleteById(id: string): Promise<void>;
  update(record: BasicRecord): Promise<void>;
  findById(id: string): Promise<BasicRecord | null>;
  findAllByQuery(query: Query<BasicRecord>): Promise<BasicRecord[]>;
  getAll(): Promise<BasicRecord[]>;
}

interface StorageService<T extends BaseRecord> {
  save(record: T): Promise<T>;
  delete(record: T): Promise<void>;
  deleteById(id: string): Promise<void>;
  update(record: T): Promise<void>;
  findById(
    id: string,
    recordClass: BaseRecordConstructor<T>
  ): Promise<T | null>;
  findAllByQuery(
    query: Query<T>,
    recordClass: BaseRecordConstructor<T>
  ): Promise<T[]>;
  getAll(recordClass: BaseRecordConstructor<T>): Promise<T[]>;
}
interface StorageRecord {
  name: string;
  value: string;
  tags: Record<string, unknown>;
  category: string;
}

type Constructor<T = BaseRecord> = new (...args: any[]) => T;

interface BaseRecordConstructor<T> extends Constructor<T> {
  type: string;
}

export { BaseRecord, RecordType };
export type {
  StorageApi,
  Query,
  SaveBasicRecordOption,
  StorageRecord,
  Tags,
  StorageService,
  BaseRecordConstructor,
};
