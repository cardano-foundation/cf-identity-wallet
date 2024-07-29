import { BaseRecord } from "../../storage/storage.types";
import { IpexMessage } from "../agent.types";

interface IpexMessageProps {
  id: string;
  content: IpexMessage;
  createdAt?: Date;
  connectionId: string;
}

class IpexMessageRecord extends BaseRecord {
  content!: IpexMessage;
  connectionId!: string;

  static readonly type = "IpexMessagMetadataRecord";
  readonly type = IpexMessageRecord.type;

  constructor(props: IpexMessageProps) {
    super();

    if (props) {
      this.id = props.id;
      this.content = props.content;
      this.connectionId = props.connectionId;
      this.createdAt = props.createdAt ?? new Date();
    }
  }

  getTags() {
    return {
      ...this._tags,
      connectionId: this.connectionId,
      id: this.id,
    };
  }
}

export { IpexMessageRecord };
export type { IpexMessageProps };
