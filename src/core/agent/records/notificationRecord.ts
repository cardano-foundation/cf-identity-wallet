import { BaseRecord, Tags } from "../../storage/storage.types";
import { NotificationRoute } from "../agent.types";
import { LinkedRequest } from "./notificationRecord.types";
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
  credentialId?: string;
  linkedRequest?: LinkedRequest;
}

class NotificationRecord extends BaseRecord {
  a!: Record<string, unknown>;
  route!: NotificationRoute;
  read!: boolean;
  multisigId?: string;
  connectionId!: string;
  linkedRequest!: LinkedRequest;
  credentialId?: string;

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
      this.multisigId = props.multisigId;
      this.connectionId = props.connectionId;
      this._tags = props.tags ?? {};
      this.linkedRequest = props.linkedRequest ?? { accepted: false };
      this.credentialId = props.credentialId;
    }
  }

  getTags() {
    return {
      route: this.route,
      read: this.read,
      multisigId: this.multisigId,
      exnSaid: this.a.d,
      credentialId: this.credentialId,
      ...this._tags,
    };
  }
}

export type { NotificationRecordStorageProps };
export { NotificationRecord };
