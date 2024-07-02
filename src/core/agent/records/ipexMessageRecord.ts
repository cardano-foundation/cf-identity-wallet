import { BaseRecord } from "../../storage/storage.types";
import { IpexMessages } from "../agent.types";

interface IpexMessageProps {
  id: string;
  content: IpexMessages;
  connectionId: string;
}

class IpexMessageRecord extends BaseRecord {
  content!: IpexMessages;
  connectionId!: string;

  static readonly type = "IpexMessagMetadataRecord";
  readonly type = IpexMessageRecord.type;

  constructor(props: {
    id: string;
    content: IpexMessages;
    connectionId: string;
  }) {
    super();

    if (props) {
      this.id = props.id;
      this.content = props.content;
      this.connectionId = props.connectionId;
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
