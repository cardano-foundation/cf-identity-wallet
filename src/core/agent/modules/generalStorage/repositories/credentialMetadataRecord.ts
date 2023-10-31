import { BaseRecord, JsonCredential } from "@aries-framework/core";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
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
  degreeType!: string;
  image!: string;
  givenName!: string;
  familyName!: string;
  birthCountry!: string;
  lprCategory!: string;
  residentSince!: string;
  summitType!: string;
  startDate!: string;
  endDate!: string;
  passId!: string;

  static readonly type = "CredentialMetadataRecord";
  readonly type = CredentialMetadataRecord.type;

  constructor(props: any) {
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
      this.degreeType = props.degreeType;
      this.image = props.image;
      this.givenName = props.givenName;
      this.familyName = props.familyName;
      this.birthCountry = props.birthCountry;
      this.lprCategory = props.lprCategory;
      this.residentSince = props.residentSince;
      this.summitType = props.summitType;
      this.startDate = props.startDate;
      this.endDate = props.endDate;
      this.passId = props.passId;
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
