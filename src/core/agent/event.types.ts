import { ConnectionStatus, KeriaNotification } from "./agent.types";
import { OperationPendingRecord } from "./records/operationPendingRecord";
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
  NotificationAdded = "NotificationAdded ",
  OperationComplete = "OperationComplete",
  OperationAdded = "OperationAdded",
  ConnectionStateChanged = "ConnectionStateChanged",
  AcdcStateChanged = "AcdcStateChanged",
  KeriaStatusChanged = "KeriaStatusChanged",
}

interface NotificationAddedEvent extends BaseEventEmitter {
  type: typeof EventTypes.NotificationAdded;
  payload: {
    keriaNotif: KeriaNotification;
  };
}

interface OperationCompleteEvent extends BaseEventEmitter {
  type: typeof EventTypes.OperationComplete;
  payload: {
    oid: string;
    opType: OperationPendingRecordType;
  };
}

interface OperationAddedEvent extends BaseEventEmitter {
  type: typeof EventTypes.OperationAdded;
  payload: {
    operation: OperationPendingRecord;
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
  NotificationAddedEvent,
  OperationCompleteEvent,
  BaseEventEmitter,
  ConnectionStateChangedEvent,
  AcdcStateChangedEvent,
  KeriaStatusChangedEvent,
  OperationAddedEvent,
};
export { EventTypes };
