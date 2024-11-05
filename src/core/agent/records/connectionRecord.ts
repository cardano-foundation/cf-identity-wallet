import { BaseRecord, Tags } from "../../storage/storage.types";
import { randomSalt } from "../services/utils";

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
  pendingDeletion = false;
  static readonly type = "ConnectionRecord";
  readonly type = ConnectionRecord.type;

  constructor(props: ConnectionRecordStorageProps) {
    super();
    if (props) {
      this.id = props.id ?? randomSalt();
      this.createdAt = props.createdAt ?? new Date();
      this.alias = props.alias;
      this.oobi = props.oobi;
      this.groupId = props.groupId;
      this.pending = props.pending;
      this.pendingDeletion = false;
      this._tags = props.tags ?? {};
    }
  }

  getTags() {
    return {
      ...this._tags,
      groupId: this.groupId,
      pendingDeletion: this.pendingDeletion,
      pending: this.pending,
    };
  }
}

export type { ConnectionRecordStorageProps };
export { ConnectionRecord };
