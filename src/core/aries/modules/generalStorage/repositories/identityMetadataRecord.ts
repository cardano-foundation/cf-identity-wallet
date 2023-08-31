import { BaseRecord } from "@aries-framework/core";
import {IdentityType} from "../../../ariesAgent.types";

export interface IdentityMetadataRecordProps {
  id: string;
  displayName: string;
  colors: [string, string];
  method: IdentityType;
  signifyName?: string;
  createdAt?: Date;
  isDelete?: boolean
}

class IdentityMetadataRecord extends BaseRecord implements IdentityMetadataRecordProps{
  displayName!: string;
  method!: IdentityType;
  colors!: [string, string];
  isDelete?: boolean;
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
      this.isDelete = props.isDelete ?? false;
      this.createdAt = props.createdAt ?? new Date();
    }
  }

  getTags() {
    return this._tags;
  }
}

export { IdentityMetadataRecord };
