import { Salter } from "signify-ts";
import { BaseRecord, Tags } from "../../storage/storage.types";

interface BasicRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: Tags;
  content: Record<string, unknown>;
}

class BasicRecord extends BaseRecord {
  content!: Record<string, unknown>;
  static readonly type = "BasicRecord";
  readonly type = BasicRecord.type;

  constructor(props: BasicRecordStorageProps) {
    super();
    if (props) {
      this.id = props.id ?? new Salter({}).qb64;
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
