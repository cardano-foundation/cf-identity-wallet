import { BaseRecord } from "@aries-framework/core";
import { IdentifierType } from "../../../agent.types";

interface IdentifierMetadataRecordProps {
  id: string;
  displayName: string;
  colors: [string, string];
  method: IdentifierType;
  signifyName?: string;
  createdAt?: Date;
  isArchived?: boolean;
}

class IdentifierMetadataRecord
  extends BaseRecord
  implements IdentifierMetadataRecordProps
{
  displayName!: string;
  method!: IdentifierType;
  colors!: [string, string];
  isArchived?: boolean;
  signifyName?: string | undefined;

  static readonly type = "IdentifierMetadataRecord";
  readonly type = IdentifierMetadataRecord.type;

  constructor(props: IdentifierMetadataRecordProps) {
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

export type { IdentifierMetadataRecordProps };
export { IdentifierMetadataRecord };
