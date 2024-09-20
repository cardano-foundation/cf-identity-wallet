import { KeriaNotification } from "./agent.types";
import { OperationPendingRecordType } from "./records/operationPendingRecord.type";

interface BaseEventEmitter {
  type: string;
  payload: Record<string, unknown>;
}

enum EventTypes {
  Notification = "Notification",
  Operation = "Operation",
}

interface NotificationEvent extends BaseEventEmitter {
  type: typeof EventTypes.Notification;
  payload: {
    keriaNotif: KeriaNotification;
  };
}

interface OperationPendingEvent extends BaseEventEmitter {
  type: typeof EventTypes.Operation;
  payload: {
    oid: string;
    opType: OperationPendingRecordType;
  };
}

export type { NotificationEvent, OperationPendingEvent };
export { EventTypes };
