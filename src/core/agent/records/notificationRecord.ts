import { v4 as uuidv4 } from "uuid";
import { BaseRecord, Tags } from "../../storage/storage.types";

interface NotificationRecordStorageProps {
  id?: string;
  createdAt?: Date;
  tags?: Tags;
  a: Record<string, unknown>;
  route: string;
  isDismissed: boolean;
  multisigId?: string;
}

class NotificationRecord extends BaseRecord {
  a!: Record<string, unknown>;
  route!: string;
  isDismissed!: boolean;
  multisigId?: string;
  static readonly type = "NotificationRecord";
  readonly type = NotificationRecord.type;

  constructor(props: NotificationRecordStorageProps) {
    super();
    if (props) {
      this.id = props.id ?? uuidv4();
      this.createdAt = props.createdAt ?? new Date();
      this.a = props.a;
      this.route = props.route;
      this.isDismissed = props.isDismissed;
      this.multisigId = props.multisigId ?? undefined;
      this._tags = props.tags ?? {};
    }
  }

  getTags() {
    return {
      route: this.route,
      isDismissed: this.isDismissed,
      multisigId: this.multisigId,
      ...this._tags,
    };
  }
}

export type { NotificationRecordStorageProps };
export { NotificationRecord };
