import { BaseRecord } from "@aries-framework/core";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
  ResidencyCredCachedDetails,
  SummitCredCachedDetails,
  UniversityCredCachedDetails,
} from "./credentialMetadataRecord.types";

class CredentialMetadataRecord
  extends BaseRecord
  implements CredentialMetadataRecordProps
{
  colors!: [string, string];
  isArchived?: boolean;
  issuanceDate!: string;
  issuerLogo?: string;
  credentialType!: string;
  status!: CredentialMetadataRecordStatus;
  credentialRecordId!: string;
  connectionId?: string;
  cachedDetails?:
    | UniversityCredCachedDetails
    | ResidencyCredCachedDetails
    | SummitCredCachedDetails;

  static readonly type = "CredentialMetadataRecord";
  readonly type = CredentialMetadataRecord.type;

  constructor(props: CredentialMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.credentialRecordId = props.credentialRecordId;
      this.colors = props.colors;
      this.isArchived = props.isArchived ?? false;
      this.createdAt = props.createdAt ?? new Date();
      this.issuanceDate = props.issuanceDate;
      this.issuerLogo = props.issuerLogo;
      this.credentialType = props.credentialType;
      this.status = props.status;
      this.connectionId = props.connectionId;
      this.cachedDetails = props.cachedDetails;
    }
  }

  getTags() {
    return {
      ...this._tags,
      isArchived: this.isArchived,
      credentialRecordId: this.credentialRecordId,
    };
  }
}

export { CredentialMetadataRecord };
