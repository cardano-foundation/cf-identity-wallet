import { BaseRecord } from "@aries-framework/core";
import { IdentifierType } from "../../../services/identifierService.types";

interface IdentifierMetadataRecordProps {
  id: string;
  displayName: string;
  colors: [string, string];
  method: IdentifierType;
  signifyName?: string;
  createdAt?: Date;
  isArchived?: boolean;
  isDeleted?: boolean;
  theme: number;
}

class IdentifierMetadataRecord
  extends BaseRecord
  implements IdentifierMetadataRecordProps
{
  displayName!: string;
  method!: IdentifierType;
  colors!: [string, string];
  isArchived?: boolean;
  isDeleted?: boolean;
  signifyName?: string | undefined;
  theme!: number;

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
      this.isDeleted = props.isDeleted ?? false;
      this.createdAt = props.createdAt ?? new Date();
      this.theme = props.theme;
    }
  }

  getTags() {
    return {
      ...this._tags,
      isArchived: this.isArchived,
      isDeleted: this.isDeleted,
      method: this.method,
    };
  }
}

export type { IdentifierMetadataRecordProps };
export { IdentifierMetadataRecord };
