import { randomUUID } from "crypto";

type TagValue = string | boolean | undefined | Array<string> | null;

type BasicRecordTags = {
  [key: string]: TagValue;
  [key: number]: never;
};

interface BasicRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: BasicRecordTags;
  content: Record<string, unknown>;
}
interface SaveBasicRecordOption {
  content: Record<string, unknown>;
  id?: string;
  tags?: BasicRecordTags;
}

type SimpleQuery<T> = Partial<T>;
interface AdvancedQuery<T> {
  $and?: Query<T>[];
  $or?: Query<T>[];
  $not?: Query<T>;
}
type Query<T> = AdvancedQuery<T> | SimpleQuery<T>;

class BasicRecord {
  static readonly type = "BasicRecord";
  readonly type = "BasicRecord";
  constructor(props: BasicRecordStorageProps) {
    this.content = props.content;
    this.id = props.id || randomUUID();
    this.createdAt = props.createdAt || new Date();
    this.tags = props.tags || {};
  }
  id: string;
  createdAt: Date;
  tags: BasicRecordTags;
  content: Record<string, unknown>;
}

interface BasicStoragesApi {
  open(): Promise<void>;
  save({ content, tags, id }: SaveBasicRecordOption): Promise<BasicRecord>;
  delete(record: BasicRecord): Promise<void>;
  deleteById(id: string): Promise<void>;
  update(record: BasicRecord): Promise<void>;
  findById(id: string): Promise<BasicRecord | null>;
  findAllByQuery(query: Query<BasicRecord>): Promise<BasicRecord[]>;
  getAll(): Promise<BasicRecord[]>;
}

export { BasicRecord };
export type { BasicStoragesApi, Query, SaveBasicRecordOption };
