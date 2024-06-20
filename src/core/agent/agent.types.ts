import { SignifyClient } from "signify-ts";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "./services/credentialService.types";
import { EventService } from "./services/eventService";
import { ConnectionHistoryType } from "./services/connection.types";

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
  OP_PASS_HINT = "op-password-hint",
  APP_ALREADY_INIT = "app-already-init",
  APP_STATE_FLAGS = "app-state-flags",
  APP_LANGUAGE = "app-language",
  IDENTIFIERS_FAVOURITES = "identifiers-favourites",
  CREDS_FAVOURITES = "creds-favourites",
  USER_NAME = "user-name",
  APP_BIOMETRY = "app-biometry",
  KERIA_NOTIFICATION_MARKER = "keria-notification-marker",
  APP_IDENTIFIER_VIEW_TYPE = "app-identifier-view-type",
  KERIA_CONNECT_URL = "keria-connect-url",
  KERIA_BOOT_URL = "keria-boot-url",
}

interface ConnectionShortDetails {
  id: string;
  label: string;
  connectionDate: string;
  logo?: string;
  status: ConnectionStatus;
  oobi?: string;
  groupId?: string;
}

type ConnectionNoteDetails = {
  id: string;
  title: string;
  message: string;
};

type IpexMessages = {
  exn: {
    v: string;
    t: string;
    d: string;
    i: string;
    p: string;
    dt: string;
    r: string;
    q: any;
    a: any;
    e: any;
  };
  pathed: {
    acdc: string;
    iss: string;
    anc: string;
  };
};

type IpexMessageDetails = {
  id: string;
  content: IpexMessages;
};

type ConnectionNoteProps = Pick<ConnectionNoteDetails, "title" | "message">;

interface ConnectionDetails extends ConnectionShortDetails {
  serviceEndpoints?: string[];
  notes?: ConnectionNoteDetails[];
  linkedIpexMessages?: IpexMessageDetails[];
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
  multisigId?: string;
}

enum KeriConnectionType {
  NORMAL = "NORMAL",
  MULTI_SIG_INITIATOR = "MULTI_SIG_INITIATOR",
}

type OobiScan =
  | { type: KeriConnectionType.NORMAL }
  | { type: KeriConnectionType.MULTI_SIG_INITIATOR; groupId: string };

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
  isPending?: boolean;
}

interface IdentifierResult {
  name: string;
  prefix: string;
  salty: any;
}

interface AgentUrls {
  url: string;
  bootUrl: string;
}

enum NotificationRoute {
  ExnIpexGrant = "/exn/ipex/grant",
  MultiSigIcp = "/multisig/icp",
  MultiSigRot = "/multisig/rot",
  ExnIpexApply = "/exn/ipex/apply",
  ExnIpexAgree = "/exn/ipex/agree",
}

interface BranAndMnemonic {
  bran: string;
  mnemonic: string;
}

export {
  ConnectionStatus,
  MiscRecordId,
  ConnectionEventTypes,
  AcdcEventTypes,
  NotificationRoute,
  KeriConnectionType,
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
  OobiScan,
  BaseEventEmitter,
  KeriaNotificationMarker,
  AgentServicesProps,
  CreateIdentifierResult,
  IdentifierResult,
  KeriaStatusChangedEvent,
  AgentUrls,
  BranAndMnemonic,
  IpexMessages,
  IpexMessageDetails,
};
