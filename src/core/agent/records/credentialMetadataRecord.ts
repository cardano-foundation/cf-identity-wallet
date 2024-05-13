import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "./credentialMetadataRecord.types";
import { BaseRecord } from "../../storage/storage.types";

class CredentialMetadataRecord extends BaseRecord {
  isArchived?: boolean;
  isDeleted?: boolean;
  issuanceDate!: string;
  credentialType!: string;
  status!: CredentialMetadataRecordStatus;
  connectionId?: string;

  static readonly type = "CredentialMetadataRecord";
  readonly type = CredentialMetadataRecord.type;

  constructor(props: CredentialMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.isArchived = props.isArchived ?? false;
      this.isDeleted = props.isDeleted ?? false;
      this.createdAt = props.createdAt ?? new Date();
      this.issuanceDate = props.issuanceDate;
      this.credentialType = props.credentialType;
      this.status = props.status;
      this.connectionId = props.connectionId;
    }
  }

  getTags() {
    return {
      ...this._tags,
      isArchived: this.isArchived,
      isDeleted: this.isDeleted,
      connectionId: this.connectionId,
      id: this.id,
    };
  }
}

export { CredentialMetadataRecord };
