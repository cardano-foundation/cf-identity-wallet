import { v4 as uuidv4 } from "uuid";
import { BaseRecord, RecordType, Tags } from "../../storage/storage.types";

interface BasicRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: Tags;
  content: Record<string, unknown>;
  type: RecordType;
}

class BasicRecord extends BaseRecord {
  content!: Record<string, unknown>;
  type!: RecordType;

  constructor(props: BasicRecordStorageProps) {
    super();
    this.id = props.id ?? uuidv4();
    this.createdAt = props.createdAt ?? new Date();
    this.content = props.content;
    this._tags = props.tags ?? {};
    this.type = props.type;
  }

  getTags() {
    return {
      ...this._tags,
    };
  }
}

export { BasicRecord };
