import { BaseRecord } from "@aries-framework/core";
import { IdentityType } from "../../../ariesAgent.types";

export interface CredentialMetadataRecordProps {
  id: string;
  displayName: string;
  colors: [string, string];
  createdAt?: Date;
  isArchived?: boolean;
}

class CredentialMetadataRecord
  extends BaseRecord
  implements CredentialMetadataRecordProps
{
  displayName!: string;
  method!: IdentityType;
  colors!: [string, string];
  isArchived?: boolean;

  static readonly type = "CredentialMetadataRecord";
  readonly type = CredentialMetadataRecord.type;

  constructor(props: CredentialMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.displayName = props.displayName;
      this.colors = props.colors;
      this.isArchived = props.isArchived ?? false;
      this.createdAt = props.createdAt ?? new Date();
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
