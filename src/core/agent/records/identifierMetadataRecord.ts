import { BaseRecord } from "../../storage/storage.types";

interface groupMetadata {
  groupId: string;
  groupInitiator: boolean;
  groupCreated: boolean;
}

interface IdentifierMetadataRecordProps {
  id: string;
  displayName: string;
  createdAt?: Date;
  isDeleted?: boolean;
  isPending?: boolean;
  theme: number;
  multisigManageAid?: string;
  groupMetadata?: groupMetadata;
}

class IdentifierMetadataRecord extends BaseRecord {
  displayName!: string;
  isDeleted?: boolean;
  isPending?: boolean;
  pendingDeletion = false;
  theme!: number;
  multisigManageAid?: string;
  groupMetadata?: groupMetadata;

  static readonly type = "IdentifierMetadataRecord";
  readonly type = IdentifierMetadataRecord.type;

  constructor(props: IdentifierMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.displayName = props.displayName;
      this.isDeleted = props.isDeleted ?? false;
      this.isPending = props.isPending ?? false;
      this.multisigManageAid = props.multisigManageAid;
      this.createdAt = props.createdAt ?? new Date();
      this.theme = props.theme;
      this.groupMetadata = props.groupMetadata;
    }
  }

  getTags() {
    return {
      ...this._tags,
      groupId: this.groupMetadata?.groupId,
      isDeleted: this.isDeleted,
      isPending: this.isPending,
      groupCreated: this.groupMetadata?.groupCreated,
      pendingDeletion: this.pendingDeletion,
    };
  }
}

export type { IdentifierMetadataRecordProps };
export { IdentifierMetadataRecord };
