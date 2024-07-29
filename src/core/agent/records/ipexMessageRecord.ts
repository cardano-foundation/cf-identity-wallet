import { BaseRecord } from "../../storage/storage.types";
import { IpexMessage } from "../agent.types";

interface IpexMessageProps {
  id: string;
  content: IpexMessage;
  isUpdate?: boolean;
  createdAt?: Date;
  connectionId: string;
}

class IpexMessageRecord extends BaseRecord {
  content!: IpexMessage;
  connectionId!: string;
  isUpdate?: boolean;

  static readonly type = "IpexMessageRecord";
  readonly type = IpexMessageRecord.type;

  constructor(props: IpexMessageProps) {
    super();

    if (props) {
      this.id = props.id;
      this.content = props.content;
      this.connectionId = props.connectionId;
      this.isUpdate = props.isUpdate ?? false;
      this.createdAt = props.createdAt ?? new Date();
    }
  }

  getTags() {
    return {
      ...this._tags,
      connectionId: this.connectionId,
    };
  }
}

export { IpexMessageRecord };
export type { IpexMessageProps };
