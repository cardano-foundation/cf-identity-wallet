import { v4 as uuidv4 } from "uuid";
import { BaseRecord, Tags } from "../../storage/storage.types";
import { OperationPendingRecordType } from "./operationPendingRecord.type";

interface OperationPendingRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: Tags;
  recordType: OperationPendingRecordType;
}

class OperationPendingRecord extends BaseRecord {
  recordType!: OperationPendingRecordType;
  static readonly type = "OperationPendingRecord";
  readonly type = OperationPendingRecord.type;

  constructor(props: OperationPendingRecordStorageProps) {
    super();
    if (props) {
      this.id = props.id ?? uuidv4();
      this.createdAt = props.createdAt ?? new Date();
      this.recordType = props.recordType;
      this._tags = props.tags ?? {};
    }
  }

  getTags() {
    return {
      ...this._tags,
      recordType: this.recordType,
    };
  }
}

export type { OperationPendingRecordStorageProps };
export { OperationPendingRecord };
