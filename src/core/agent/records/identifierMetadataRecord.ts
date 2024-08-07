import { BaseRecord } from "../../storage/storage.types";

interface groupMetadata {
  groupId: string;
  groupInitiator: boolean;
  groupCreated: boolean;
}

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
  groupMetadata?: groupMetadata;
}

class IdentifierMetadataRecord extends BaseRecord {
  displayName!: string;
  isArchived?: boolean;
  isDeleted?: boolean;
  isPending?: boolean;
  signifyOpName?: string;
  signifyName!: string;
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
      this.signifyName = props.signifyName;
      this.isArchived = props.isArchived ?? false;
      this.isDeleted = props.isDeleted ?? false;
      this.isPending = props.isPending ?? false;
      this.signifyOpName = props.signifyOpName;
      this.multisigManageAid = props.multisigManageAid;
      this.createdAt = props.createdAt ?? new Date();
      this.theme = props.theme;
      this.groupMetadata = props.groupMetadata;
    }
  }

  getTags() {
    return {
      ...this._tags,
      signifyName: this.signifyName,
      groupId: this.groupMetadata?.groupId,
      isArchived: this.isArchived,
      isDeleted: this.isDeleted,
      isPending: this.isPending,
      groupCreated: this.groupMetadata?.groupCreated,
    };
  }
}

export type { IdentifierMetadataRecordProps };
export { IdentifierMetadataRecord };
