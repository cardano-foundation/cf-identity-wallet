import { BaseRecord } from "@aries-framework/core";

export interface IdentityMetadataRecordProps {
  id: string;
  displayName: string;
  colors: [string, string];
  createdAt?: Date;
  isDelete?: boolean
}

class IdentityMetadataRecord extends BaseRecord {
  displayName!: string;
  colors!: [string, string];
  isDelete?: boolean | undefined;

  static readonly type = "IdentityMetadataRecord";
  readonly type = IdentityMetadataRecord.type;

  constructor(props: IdentityMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.displayName = props.displayName;
      this.colors = props.colors;
      this.isDelete = props.isDelete ?? false;
      this.createdAt = props.createdAt ?? new Date();
    }
  }

  getTags() {
    return this._tags;
  }
}

export { IdentityMetadataRecord };
