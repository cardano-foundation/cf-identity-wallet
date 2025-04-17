import { BaseRecord, Tags } from "../../storage/storage.types";
import { CreationStatus } from "../agent.types";
import { randomSalt } from "../services/utils";

interface ConnectionRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: Tags;
  alias: string;
  oobi: string;
  groupId?: string;
  creationStatus?: CreationStatus;
  pendingDeletion?: boolean;
  sharedIdentifier?: string;
}

class ConnectionRecord extends BaseRecord {
  alias!: string;
  oobi!: string;
  groupId?: string;
  creationStatus!: CreationStatus;
  pendingDeletion!: boolean;
  sharedIdentifier?: string;

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
      this.creationStatus = props.creationStatus ?? CreationStatus.PENDING;
      this.pendingDeletion = props.pendingDeletion ?? false;
      this.sharedIdentifier = props.sharedIdentifier;
      this._tags = props.tags ?? {};
    }
  }

  getTags() {
    return {
      ...this._tags,
      groupId: this.groupId,
      pendingDeletion: this.pendingDeletion,
      creationStatus: this.creationStatus,
    };
  }
}

export type { ConnectionRecordStorageProps };
export { ConnectionRecord };
