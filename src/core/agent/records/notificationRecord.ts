import { BaseRecord, Tags } from "../../storage/storage.types";
import { NotificationRoute } from "../agent.types";
import { LinkedGroupRequestDetails } from "./notificationRecord.types";
import { randomSalt } from "../services/utils";

interface NotificationRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: Tags;
  a: Record<string, unknown>;
  route: NotificationRoute;
  read: boolean;
  multisigId?: string;
  connectionId: string;
  linkedGroupRequests?: Record<string, LinkedGroupRequestDetails>;
}

class NotificationRecord extends BaseRecord {
  a!: Record<string, unknown>;
  route!: NotificationRoute;
  read!: boolean;
  multisigId?: string;
  connectionId!: string;
  linkedGroupRequests!: Record<string, LinkedGroupRequestDetails>;
  static readonly type = "NotificationRecord";
  readonly type = NotificationRecord.type;

  constructor(props: NotificationRecordStorageProps) {
    super();
    if (props) {
      this.id = props.id ?? randomSalt();
      this.createdAt = props.createdAt ?? new Date();
      this.a = props.a;
      this.route = props.route;
      this.read = props.read;
      this.multisigId = props.multisigId ?? undefined;
      this.connectionId = props.connectionId;
      this._tags = props.tags ?? {};
      this.linkedGroupRequests = props.linkedGroupRequests ?? {};
    }
  }

  getTags() {
    return {
      route: this.route,
      read: this.read,
      multisigId: this.multisigId,
      exnSaid: this.a.d,
      ...this._tags,
    };
  }
}

export type { NotificationRecordStorageProps };
export { NotificationRecord };
