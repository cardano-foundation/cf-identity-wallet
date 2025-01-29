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
  groupReplied?: boolean,
  initiatorAid?: string,
  groupInitiator?: boolean,
}

class NotificationRecord extends BaseRecord {
  a!: Record<string, unknown>;
  route!: NotificationRoute;
  read!: boolean;
  multisigId?: string;
  connectionId!: string;
  linkedRequest!: LinkedRequest;
  credentialId?: string;
  groupReplied?: boolean;
  initiatorAid?: string;
  groupInitiator?: boolean;
  hidden = false;  // Hide from UI but don't delete (used for reliability while recovering IPEX long running operations)

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
      this.groupReplied = props.groupReplied;
      this.initiatorAid = props.initiatorAid;
      this.groupInitiator = props.groupInitiator;
    }
  }

  getTags() {
    return {
      ...this._tags,
      route: this.route,
      read: this.read,
      multisigId: this.multisigId,
      exnSaid: this.a.d,
      credentialId: this.credentialId,
      groupReplied: this.groupReplied,
      initiatorAid: this.initiatorAid,
      groupInitiator: this.groupInitiator,
      currentLinkedRequest: this.linkedRequest.current,
      hidden: this.hidden,
    };
  }
}

export type { NotificationRecordStorageProps };
export { NotificationRecord };
