import { v4 as uuidv4 } from "uuid";
import { BaseRecord, Tags } from "../../storage/storage.types";

interface ConnectionRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: Tags;
  alias: string;
  oobi: string;
  groupId?: string;
  pending: boolean;
}

class ConnectionRecord extends BaseRecord {
  alias!: string;
  oobi!: string;
  groupId?: string;
  pending!: boolean;
  static readonly type = "ConnectionRecord";
  readonly type = ConnectionRecord.type;

  constructor(props: ConnectionRecordStorageProps) {
    super();
    if (props) {
      this.id = props.id ?? uuidv4();
      this.createdAt = props.createdAt ?? new Date();
      this.alias = props.alias;
      this.oobi = props.oobi;
      this.groupId = props.groupId;
      this.pending = props.pending;
      this._tags = props.tags ?? {};
    }
  }

  getTags() {
    return {
      ...this._tags,
      groupId: this.groupId,
    };
  }
}

export type { ConnectionRecordStorageProps };
export { ConnectionRecord };
