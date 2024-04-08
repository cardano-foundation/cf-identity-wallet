import { BaseRecord } from "../../storage/storage.types";

interface IdentifierMetadataRecordProps {
  id: string;
  displayName: string;
  colors: [string, string];
  signifyName?: string;
  createdAt?: Date;
  isArchived?: boolean;
  isDeleted?: boolean;
  isPending?: boolean;
  theme: number;
  signifyOpName?: string;
  multisigManageAid?: string;
}

class IdentifierMetadataRecord
  extends BaseRecord
  implements IdentifierMetadataRecordProps
{
  displayName!: string;
  colors!: [string, string];
  isArchived?: boolean;
  isDeleted?: boolean;
  isPending?: boolean;
  signifyOpName?: string | undefined;
  signifyName?: string | undefined;
  theme!: number;
  multisigManageAid?: string | undefined;

  static readonly type = "IdentifierMetadataRecord";
  readonly type = IdentifierMetadataRecord.type;

  constructor(props: IdentifierMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.displayName = props.displayName;
      this.colors = props.colors;
      this.signifyName = props.signifyName;
      this.isArchived = props.isArchived ?? false;
      this.isDeleted = props.isDeleted ?? false;
      this.isPending = props.isPending ?? false;
      this.signifyOpName = props.signifyOpName;
      this.multisigManageAid = props.multisigManageAid;
      this.createdAt = props.createdAt ?? new Date();
      this.theme = props.theme;
    }
  }

  getTags() {
    return {
      ...this._tags,
      isArchived: this.isArchived,
      isDeleted: this.isDeleted,
      isPending: this.isPending,
    };
  }
}

export type { IdentifierMetadataRecordProps };
export { IdentifierMetadataRecord };
