import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "./credentialMetadataRecord.types";
import { BaseRecord } from "../../storage/storage.types";

class CredentialMetadataRecord
  extends BaseRecord
  implements CredentialMetadataRecordProps
{
  isArchived?: boolean;
  isDeleted?: boolean;
  issuanceDate!: string;
  issuerLogo?: string;
  credentialType!: string;
  status!: CredentialMetadataRecordStatus;
  credentialRecordId!: string;
  connectionId?: string;

  static readonly type = "CredentialMetadataRecord";
  readonly type = CredentialMetadataRecord.type;

  constructor(props: CredentialMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.credentialRecordId = props.credentialRecordId;
      this.isArchived = props.isArchived ?? false;
      this.isDeleted = props.isDeleted ?? false;
      this.createdAt = props.createdAt ?? new Date();
      this.issuanceDate = props.issuanceDate;
      this.issuerLogo = props.issuerLogo;
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
      credentialRecordId: this.credentialRecordId,
      connectionId: this.connectionId,
    };
  }
}

export { CredentialMetadataRecord };
