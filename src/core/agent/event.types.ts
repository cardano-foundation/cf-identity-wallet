import { ConnectionStatus, KeriaNotification } from "./agent.types";
import { OperationPendingRecordType } from "./records/operationPendingRecord.type";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "./services/credentialService.types";

interface BaseEventEmitter {
  type: string;
  payload: Record<string, unknown>;
}

enum EventTypes {
  Notification = "Notification",
  Operation = "Operation",
  ConnectionStateChanged = "ConnectionStateChanged",
  AcdcStateChanged = "AcdcStateChanged",
  KeriaStatusChanged = "KeriaStatusChanged",
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

interface ConnectionStateChangedEvent extends BaseEventEmitter {
  type: typeof EventTypes.ConnectionStateChanged;
  payload: {
    isMultiSigInvite?: boolean;
    connectionId?: string;
    status: ConnectionStatus;
  };
}

interface AcdcStateChangedEvent extends BaseEventEmitter {
  type: typeof EventTypes.AcdcStateChanged;
  payload: {
    status: CredentialStatus;
    credential: CredentialShortDetails;
  };
}

interface KeriaStatusChangedEvent extends BaseEventEmitter {
  type: typeof EventTypes.KeriaStatusChanged;
  payload: {
    isOnline: boolean;
  };
}

export type {
  NotificationEvent,
  OperationPendingEvent,
  BaseEventEmitter,
  ConnectionStateChangedEvent,
  AcdcStateChangedEvent,
  KeriaStatusChangedEvent,
};
export { EventTypes };
