import { BaseRecord } from "@aries-framework/core";
import { IdentityType } from "../../../ariesAgent.types";

export interface CredentialMetadataRecordProps {
  id: string;
  nameOnCredential: string;
  colors: [string, string];
  createdAt?: Date;
  isArchived?: boolean;
  issuanceDate: string;
  issuerLogo: string;
  credentialType: string;
}

class CredentialMetadataRecord
  extends BaseRecord
  implements CredentialMetadataRecordProps
{
  nameOnCredential!: string;
  colors!: [string, string];
  isArchived?: boolean;
  issuanceDate!: string;
  issuerLogo!: string;
  credentialType!: string;

  static readonly type = "CredentialMetadataRecord";
  readonly type = CredentialMetadataRecord.type;

  constructor(props: CredentialMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.nameOnCredential = props.nameOnCredential;
      this.colors = props.colors;
      this.isArchived = props.isArchived ?? false;
      this.createdAt = props.createdAt ?? new Date();
      this.issuanceDate = props.issuanceDate;
      this.issuerLogo = props.issuerLogo;
      this.credentialType = props.credentialType;
    }
  }

  getTags() {
    return {
      ...this._tags,
      isArchived: this.isArchived,
    };
  }
}

export { CredentialMetadataRecord };
