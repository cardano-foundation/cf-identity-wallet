import { CredentialMetadataRecordProps } from "./credentialMetadataRecord.types";
import { BaseRecord } from "../../storage/storage.types";
import { CredentialStatus } from "../services/credentialService.types";
import { IdentifierType } from "../services/identifier.types";

class CredentialMetadataRecord extends BaseRecord {
  isArchived?: boolean;
  pendingDeletion!: boolean;
  issuanceDate!: string;
  credentialType!: string;
  status!: CredentialStatus;
  connectionId!: string;
  schema!: string;
  identifierId!: string;
  identifierType!: IdentifierType;
  static readonly type = "CredentialMetadataRecord";
  readonly type = CredentialMetadataRecord.type;

  constructor(props: CredentialMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.isArchived = props.isArchived ?? false;
      this.createdAt = props.createdAt ?? new Date();
      this.issuanceDate = props.issuanceDate;
      this.credentialType = props.credentialType;
      this.status = props.status;
      this.connectionId = props.connectionId;
      this.schema = props.schema;
      this.identifierId = props.identifierId;
      this.identifierType = props.identifierType;
      this.pendingDeletion = props.pendingDeletion ?? false;
    }
  }

  getTags() {
    return {
      ...this._tags,
      isArchived: this.isArchived,
      pendingDeletion: this.pendingDeletion,
      connectionId: this.connectionId,
      id: this.id,
    };
  }
}

export { CredentialMetadataRecord };
