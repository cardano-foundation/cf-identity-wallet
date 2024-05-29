import { v4 as uuidv4 } from "uuid";
import { BaseRecord, Tags } from "../../storage/storage.types";
import { OperationPendingRecordType } from "./operationPendingRecord.type";

interface OperationPendingRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: Tags;
  recordId: string;
  recordType: OperationPendingRecordType;
}

class OperationPendingRecord extends BaseRecord {
  recordId!: string;
  recordType!: OperationPendingRecordType;
  static readonly type = "OperationPendingRecord";
  readonly type = OperationPendingRecord.type;
  
  constructor(props: OperationPendingRecordStorageProps) {
    super();
    if (props) {
      this.id = props.id ?? uuidv4();
      this.createdAt = props.createdAt ?? new Date();
      this.recordId = props.recordId;
      this.recordType = props.recordType;
      this._tags = props.tags ?? {};
    }
  }
  
  getTags() {
    return {
      ...this._tags,
      recordId: this.recordId,
      recordType: this.recordType,
    };
  }
}

export type { OperationPendingRecordStorageProps };
export { OperationPendingRecord };
