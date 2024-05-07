import { BaseRecord } from "../../storage/storage.types";

interface IdentifierMetadataRecordProps {
  id: string;
  displayName: string;
  signifyName: string;
  createdAt?: Date;
  isArchived?: boolean;
  isDeleted?: boolean;
  isPending?: boolean;
  theme: number;
  signifyOpName?: string;
  multisigManageAid?: string;
  delegated?: Record<string, unknown>;
}

class IdentifierMetadataRecord extends BaseRecord {
  displayName!: string;
  isArchived?: boolean;
  isDeleted?: boolean;
  isPending?: boolean;
  signifyOpName?: string | undefined;
  signifyName!: string;
  theme!: number;
  multisigManageAid?: string | undefined;
  delegated?: Record<string, unknown>;

  static readonly type = "IdentifierMetadataRecord";
  readonly type = IdentifierMetadataRecord.type;

  constructor(props: IdentifierMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.displayName = props.displayName;
      this.signifyName = props.signifyName;
      this.isArchived = props.isArchived ?? false;
      this.isDeleted = props.isDeleted ?? false;
      this.isPending = props.isPending ?? false;
      this.signifyOpName = props.signifyOpName;
      this.multisigManageAid = props.multisigManageAid;
      this.createdAt = props.createdAt ?? new Date();
      this.theme = props.theme;
      this.delegated = props.delegated;
    }
  }

  getTags() {
    return {
      ...this._tags,
      isArchived: this.isArchived,
      isDeleted: this.isDeleted,
      isPending: this.isPending,
    };
  }
}

export type { IdentifierMetadataRecordProps };
export { IdentifierMetadataRecord };
