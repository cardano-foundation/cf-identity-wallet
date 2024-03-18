import { BaseRecord } from "@aries-framework/core";
import { IdentifierType } from "../../../services/identifierService.types";

interface groupMetadata {
  groupId: string;
  groupInitiator: boolean;
  groupCreated: boolean;
}

interface IdentifierMetadataRecordProps {
  id: string;
  displayName: string;
  colors: [string, string];
  method: IdentifierType;
  signifyName?: string;
  createdAt?: Date;
  isArchived?: boolean;
  isDeleted?: boolean;
  isPending?: boolean;
  theme: number;
  signifyOpName?: string;
  multisigManageAid?: string;
  groupMetadata?: groupMetadata;
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
  isPending?: boolean;
  signifyOpName?: string | undefined;
  signifyName?: string | undefined;
  theme!: number;
  multisigManageAid?: string | undefined;
  groupMetadata?: groupMetadata;

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
      this.isPending = props.isPending ?? false;
      this.signifyOpName = props.signifyOpName;
      this.multisigManageAid = props.multisigManageAid;
      this.createdAt = props.createdAt ?? new Date();
      this.theme = props.theme;
      this.groupMetadata = props.groupMetadata;
    }
  }

  getTags() {
    return {
      ...this._tags,
      isArchived: this.isArchived,
      isDeleted: this.isDeleted,
      isPending: this.isPending,
      method: this.method,
    };
  }
}

export type { IdentifierMetadataRecordProps };
export { IdentifierMetadataRecord };
