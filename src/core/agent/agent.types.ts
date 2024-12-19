import { SignifyClient } from "signify-ts";
import { CoreEventEmitter } from "./event";
import { OperationPendingRecordType } from "./records/operationPendingRecord.type";
import { ConnectionHistoryType } from "./services/connectionService.types";

enum ConnectionStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
  ACCEPTED = "accepted",
  DELETED = "deleted",
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
  APP_CRED_VIEW_TYPE = "app-cred-view-type",
  APP_IDENTIFIER_SELECTED_FILTER = "app-identifier-selected-filter",
  APP_CRED_SELECTED_FILTER = "app-cred-selected-filter",
  KERIA_CONNECT_URL = "keria-connect-url",
  KERIA_BOOT_URL = "keria-boot-url",
  APP_IDENTIFIER_FAVOURITE_INDEX = "identifier-favourite-index",
  APP_CRED_FAVOURITE_INDEX = "cred-favourite-index",
  APP_PASSWORD_SKIPPED = "app-password-skipped",
  APP_RECOVERY_WALLET = "recovery-wallet",
  LOGIN_METADATA = "login-metadata",
  CAMERA_DIRECTION = "camera-direction",
  FAILED_NOTIFICATIONS = "failed-notifications",
  CLOUD_RECOVERY_STATUS = "cloud-recovery-status",
  IDENTIFIERS_PENDING_CREATION = "identifiers-pending-creation",
}

interface ConnectionShortDetails {
  id: string;
  label: string;
  createdAtUTC: string;
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

interface JSONObject {
  [x: string]: JSONValue;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface JSONArray extends Array<JSONValue> {}

type JSONValue = string | number | boolean | JSONObject | JSONArray;

type ExnMessage = {
  exn: {
    v: string;
    t: string;
    d: string;
    i: string;
    p: string;
    dt: string;
    r: string;
    q: JSONValue;
    a: any;
    e: any;
    rp: string;
  };
  pathed: {
    acdc?: string;
    iss?: string;
    anc?: string;
    exn?: string;
  };
};

type ConnectionNoteProps = Pick<ConnectionNoteDetails, "title" | "message">;

interface ConnectionDetails extends ConnectionShortDetails {
  serviceEndpoints: string[];
  notes: ConnectionNoteDetails[];
  historyItems: ConnectionHistoryItem[];
}
interface NotificationRpy {
  a: {
    cid: string;
    eid: string;
    role: string;
  };
  d: string;
  dt: string;
  r: string;
  t: string;
  v: string;
}

interface AuthorizationRequestExn {
  a: { gid: string };
  e: { rpy: NotificationRpy; d: string };
}

interface KeriaNotification {
  id: string;
  createdAt: string;
  a: Record<string, unknown>;
  multisigId?: string;
  connectionId: string;
  read: boolean;
  groupReplied: boolean;
}

enum KeriConnectionType {
  NORMAL = "NORMAL",
  MULTI_SIG_INITIATOR = "MULTI_SIG_INITIATOR",
}

type OobiScan =
  | { type: KeriConnectionType.NORMAL; connection: ConnectionShortDetails }
  | {
      type: KeriConnectionType.MULTI_SIG_INITIATOR;
      groupId: string;
      connection: ConnectionShortDetails;
    };

interface KeriaNotificationMarker {
  nextIndex: number;
  lastNotificationId: string;
}

interface AgentServicesProps {
  signifyClient: SignifyClient;
  eventEmitter: CoreEventEmitter;
}

interface CreateIdentifierResult {
  identifier: string;
  multisigManageAid?: string;
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
  // "Real" notifications from KERIA
  ExnIpexGrant = "/exn/ipex/grant",
  MultiSigExn = "/multisig/exn",
  MultiSigIcp = "/multisig/icp",
  MultiSigRot = "/multisig/rot",
  MultiSigRpy = "/multisig/rpy",
  ExnIpexApply = "/exn/ipex/apply",
  ExnIpexAgree = "/exn/ipex/agree",
  ExnIpexOffer = "/exn/ipex/offer",
  // Notifications from our wallet to give further feedback to the user
  LocalAcdcRevoked = "/local/acdc/revoked",
}

enum ExchangeRoute {
  IpexAdmit = "/ipex/admit",
  IpexGrant = "/ipex/grant",
  IpexApply = "/ipex/apply",
  IpexAgree = "/ipex/agree",
  IpexOffer = "/ipex/offer",
}

interface BranAndMnemonic {
  bran: string;
  mnemonic: string;
}

type OperationCallback = ({
  oid,
  opType,
}: {
  oid: string;
  opType: OperationPendingRecordType;
}) => void;

export const OOBI_RE =
  /^\/oobi\/(?<cid>[^/]+)\/(?<role>[^/]+)(?:\/(?<eid>[^/]+))?$/i;
export const OOBI_AGENT_ONLY_RE =
  /^\/oobi\/(?<cid>[^/]+)\/agent(?:\/(?<eid>[^/]+))?$/i;
export const DOOBI_RE = /^\/oobi\/(?<said>[^/]+)$/i;
export const WOOBI_RE = /^\/\.well-known\/keri\/oobi\/(?<cid>[^/]+)$/;

export {
  ConnectionStatus,
  MiscRecordId,
  NotificationRoute,
  ExchangeRoute,
  KeriConnectionType,
};

export type {
  ConnectionShortDetails,
  ConnectionDetails,
  ConnectionNoteDetails,
  ConnectionNoteProps,
  ConnectionHistoryItem,
  KeriaNotification,
  OobiScan,
  KeriaNotificationMarker,
  AgentServicesProps,
  CreateIdentifierResult,
  IdentifierResult,
  AgentUrls,
  BranAndMnemonic,
  ExnMessage,
  NotificationRpy,
  AuthorizationRequestExn,
  OperationCallback,
};
