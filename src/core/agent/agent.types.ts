import { SignifyClient } from "signify-ts";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "./services/credentialService.types";
import { EventService } from "./services/eventService";
import { IdentifierStorage } from "./records/identifierStorage";
import { CredentialStorage } from "./records/credentialStorage";
import { ConnectionHistoryType } from "./services/connection.types";
import { PeerConnectionStorage } from "./records";

enum ConnectionStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
  ACCEPTED = "accepted",
}

interface ConnectionHistoryItem {
  type: ConnectionHistoryType;
  credentialType?: string;
  timestamp: string;
}

enum MiscRecordId {
  OP_PASS_HINT = "app-op-password-hint",
}

interface ConnectionShortDetails {
  id: string;
  label: string;
  connectionDate: string;
  logo?: string;
  status: ConnectionStatus;
  oobi?: string;
}

type ConnectionNoteDetails = {
  id: string;
  title: string;
  message: string;
};

type ConnectionNoteProps = Pick<ConnectionNoteDetails, "title" | "message">;

interface ConnectionDetails extends ConnectionShortDetails {
  goalCode?: string;
  handshakeProtocols?: string[];
  requestAttachments?: string[];
  serviceEndpoints?: string[];
  notes?: ConnectionNoteDetails[];
}

enum ConnectionEventTypes {
  ConnectionStateChanged = "ConnectionStateChanged",
}

enum AcdcEventTypes {
  AcdcStateChanged = "AcdcStateChanged",
}

enum KeriaStatusEventTypes {
  KeriaStatusChanged = "KeriaStatusChanged",
}

interface ConnectionStateChangedEvent extends BaseEventEmitter {
  type: typeof ConnectionEventTypes.ConnectionStateChanged;
  payload: {
    connectionId?: string;
    status: ConnectionStatus;
  };
}

interface AcdcStateChangedEvent extends BaseEventEmitter {
  type: typeof AcdcEventTypes.AcdcStateChanged;
  payload:
    | {
        status: CredentialStatus.PENDING;
        credentialId: string;
      }
    | {
        status: CredentialStatus.CONFIRMED;
        credential: CredentialShortDetails;
      };
}

interface KeriaStatusChangedEvent extends BaseEventEmitter {
  type: typeof KeriaStatusEventTypes.KeriaStatusChanged;
  payload: {
    isOnline: boolean;
  };
}

interface KeriaNotification {
  id: string;
  createdAt: Date;
  a: Record<string, unknown>;
}

interface BaseEventEmitter {
  type: string;
  payload: Record<string, unknown>;
}

interface KeriaNotificationMarker {
  nextIndex: number;
  lastNotificationId: string;
}

interface AgentServicesProps {
  signifyClient: SignifyClient;
  eventService: EventService;
}

interface CreateIdentifierResult {
  signifyName: string;
  identifier: string;
}

interface IdentifierResult {
  name: string;
  prefix: string;
  salty: any;
}

enum NotificationRoute {
  ExnIpexGrant = "/exn/ipex/grant",
  MultiSigIcp = "/multisig/icp",
  MultiSigRot = "/multisig/rot",
  ExnIpexApply = "/exn/ipex/apply",
  ExnIpexAgree = "/exn/ipex/agree",
}

export {
  ConnectionStatus,
  MiscRecordId,
  ConnectionEventTypes,
  AcdcEventTypes,
  NotificationRoute,
  KeriaStatusEventTypes,
};

export type {
  ConnectionShortDetails,
  ConnectionDetails,
  ConnectionNoteDetails,
  ConnectionNoteProps,
  ConnectionHistoryItem,
  ConnectionStateChangedEvent,
  KeriaNotification,
  AcdcStateChangedEvent,
  BaseEventEmitter,
  KeriaNotificationMarker,
  AgentServicesProps,
  CreateIdentifierResult,
  IdentifierResult,
  KeriaStatusChangedEvent,
};
