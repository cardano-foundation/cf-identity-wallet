import { v4 as uuidv4 } from "uuid";
import { BaseRecord, Tags } from "../../storage/storage.types";

interface BasicRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: Tags;
  content: Record<string, unknown>;
}

class BasicRecord extends BaseRecord implements BasicRecordStorageProps {
  content!: Record<string, unknown>;
  static readonly type = "BasicRecord";
  readonly type = BasicRecord.type;

  constructor(props: BasicRecordStorageProps) {
    super();
    if (props) {
      this.id = props.id ?? uuidv4();
      this.createdAt = props.createdAt ?? new Date();
      this.content = props.content;
      this._tags = props.tags ?? {};
    }
  }

  getTags() {
    return {
      ...this._tags,
    };
  }
}

export { BasicRecord };
