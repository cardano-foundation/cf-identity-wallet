import { BaseRecord } from "@aries-framework/core";
import { IdentityType } from "../../../ariesAgent.types";

export interface IdentityMetadataRecordProps {
  id: string;
  displayName: string;
  colors: [string, string];
  method: IdentityType;
  signifyName?: string;
  createdAt?: Date;
  isArchived?: boolean;
}

class IdentityMetadataRecord
  extends BaseRecord
  implements IdentityMetadataRecordProps
{
  displayName!: string;
  method!: IdentityType;
  colors!: [string, string];
  isArchived?: boolean;
  signifyName?: string | undefined;

  static readonly type = "IdentityMetadataRecord";
  readonly type = IdentityMetadataRecord.type;

  constructor(props: IdentityMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.displayName = props.displayName;
      this.method = props.method;
      this.colors = props.colors;
      this.signifyName = props.signifyName;
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

export { IdentityMetadataRecord };
