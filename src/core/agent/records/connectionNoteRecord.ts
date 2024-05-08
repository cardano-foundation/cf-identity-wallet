import { v4 as uuidv4 } from "uuid";
import { BaseRecord, Tags } from "../../storage/storage.types";

interface ConnectionNoteRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: Tags;
  connectionId: string;
  title: string;
  message: string;
}

class ConnectionNoteRecord extends BaseRecord {
  connectionId!: string;
  title!: string;
  message!: string;
  static readonly type = "ConnectionRecord";
  readonly type = ConnectionNoteRecord.type;

  constructor(props: ConnectionNoteRecordStorageProps) {
    super();
    if (props) {
      this.id = props.id ?? uuidv4();
      this.createdAt = props.createdAt ?? new Date();
      this.connectionId = props.connectionId;
      this.title = props.title;
      this.message = props.message;
      this._tags = props.tags ?? {};
    }
  }

  getTags() {
    return {
      connectionId: this.connectionId,
      ...this._tags,
    };
  }
}

export type { ConnectionNoteRecordStorageProps };
export { ConnectionNoteRecord };
