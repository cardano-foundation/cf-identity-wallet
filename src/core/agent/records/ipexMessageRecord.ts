import { BaseRecord } from "../../storage/storage.types";
import { IpexMessage } from "../agent.types";
import { ConnectionHistoryType } from "../services/connection.types";

interface IpexMessageProps {
  id: string;
  credentialType: string;
  content: IpexMessage;
  historyType: ConnectionHistoryType;
  createdAt?: Date;
  connectionId: string;
}

class IpexMessageRecord extends BaseRecord {
  credentialType!: string;
  content!: IpexMessage;
  connectionId!: string;
  historyType!: ConnectionHistoryType;

  static readonly type = "IpexMessageRecord";
  readonly type = IpexMessageRecord.type;

  constructor(props: IpexMessageProps) {
    super();

    if (props) {
      this.id = props.id;
      this.credentialType = props.credentialType;
      this.content = props.content;
      this.connectionId = props.connectionId;
      this.historyType = props.historyType;
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
