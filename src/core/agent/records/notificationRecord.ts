import { v4 as uuidv4 } from "uuid";
import { BaseRecord, Tags } from "../../storage/storage.types";
import { NotificationRoute } from "../agent.types";

interface NotificationRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: Tags;
  a: Record<string, unknown>;
  route: NotificationRoute;
  read: boolean;
  multisigId?: string;
  connectionId: string;
  multisigLinks?: Record<string, Array<string>>;
  grantSaid?: string;
}

class NotificationRecord extends BaseRecord {
  a!: Record<string, unknown>;
  route!: NotificationRoute;
  read!: boolean;
  multisigId?: string;
  connectionId!: string;
  multisigLinks?: Record<string, Array<string>>;
  grantSaid?: string;
  static readonly type = "NotificationRecord";
  readonly type = NotificationRecord.type;

  constructor(props: NotificationRecordStorageProps) {
    super();
    if (props) {
      this.id = props.id ?? uuidv4();
      this.createdAt = props.createdAt ?? new Date();
      this.a = props.a;
      this.route = props.route;
      this.read = props.read;
      this.multisigId = props.multisigId ?? undefined;
      this.connectionId = props.connectionId;
      this._tags = props.tags ?? {};
      this.multisigLinks = props.multisigLinks ?? {};
      this.grantSaid = props.grantSaid ?? undefined;
    }
  }

  getTags() {
    return {
      route: this.route,
      read: this.read,
      grantSaid: this.grantSaid,
      multisigId: this.multisigId,
      ...this._tags,
    };
  }
}

export type { NotificationRecordStorageProps };
export { NotificationRecord };
