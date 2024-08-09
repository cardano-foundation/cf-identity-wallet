import { CredentialMetadataRecordProps } from "./credentialMetadataRecord.types";
import { BaseRecord } from "../../storage/storage.types";
import { CredentialStatus } from "../services/credentialService.types";

class CredentialMetadataRecord extends BaseRecord {
  isArchived?: boolean;
  isDeleted?: boolean;
  issuanceDate!: string;
  credentialType!: string;
  status!: CredentialStatus;
  connectionId!: string;
  schema!: string;

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
      this.schema = props.schema;
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
