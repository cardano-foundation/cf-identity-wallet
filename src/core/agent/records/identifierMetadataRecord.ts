import { BaseRecord } from "../../storage/storage.types";
import { CreationStatus } from "../services/identifier.types";

interface groupMetadata {
  groupId: string;
  groupInitiator: boolean;
  groupCreated: boolean;
}

interface IdentifierMetadataRecordProps {
  id: string;
  displayName: string;
  creationStatus?: CreationStatus;
  createdAt?: Date;
  isDeleted?: boolean;
  theme: number;
  multisigManageAid?: string;
  groupMetadata?: groupMetadata;
  sxlt?: string;
}

class IdentifierMetadataRecord extends BaseRecord {
  displayName!: string;
  theme!: number;
  creationStatus!: CreationStatus;
  isDeleted!: boolean;
  pendingDeletion = false;
  multisigManageAid?: string;
  groupMetadata?: groupMetadata;
  sxlt?: string;

  static readonly type = "IdentifierMetadataRecord";
  readonly type = IdentifierMetadataRecord.type;

  constructor(props: IdentifierMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.displayName = props.displayName;
      this.createdAt = props.createdAt ?? new Date();
      this.theme = props.theme;
      this.creationStatus = props.creationStatus ?? CreationStatus.PENDING;
      this.isDeleted = props.isDeleted ?? false;
      this.groupMetadata = props.groupMetadata;
      this.multisigManageAid = props.multisigManageAid;
      this.sxlt = props.sxlt;
    }
  }

  getTags() {
    return {
      ...this._tags,
      groupId: this.groupMetadata?.groupId,
      isDeleted: this.isDeleted,
      creationStatus: this.creationStatus,
      groupCreated: this.groupMetadata?.groupCreated,
      pendingDeletion: this.pendingDeletion,
    };
  }
}

export type { IdentifierMetadataRecordProps };
export { IdentifierMetadataRecord };
