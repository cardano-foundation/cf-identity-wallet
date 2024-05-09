import { BaseRecord } from "../../storage/storage.types";

interface PeerConnectionMetadataRecordProps {
  id: string;
  name?: string;
  url?: string;
  createdAt?: Date;
  iconB64?: string;
  selectedAid?: string;
}

class PeerConnectionMetadataRecord extends BaseRecord {
  name?: string;
  url?: string;
  iconB64?: string;
  selectedAid?: string;

  static readonly type = "PeerConnectionMetadataRecord";
  readonly type = PeerConnectionMetadataRecord.type;

  constructor(props: PeerConnectionMetadataRecordProps) {
    super();

    if (props) {
      this.id = props.id;
      this.name = props.name ?? "";
      this.url = props.url ?? "";
      this.selectedAid = props.selectedAid ?? "";
      this.createdAt = props.createdAt ?? new Date();
      this.iconB64 = props.iconB64 ?? "";
    }
  }

  getTags() {
    return {
      ...this._tags,
    };
  }
}

export type { PeerConnectionMetadataRecordProps };
export { PeerConnectionMetadataRecord };
