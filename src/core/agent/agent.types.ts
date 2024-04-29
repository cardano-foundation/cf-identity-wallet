import { SignifyClient } from "signify-ts";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "./services/credentialService.types";
import { EventService } from "./services/eventService";
import { IdentifierStorage } from "./records/identifierStorage";
import { CredentialStorage } from "./records/credentialStorage";
import { BasicStorage } from "./records/basicStorage";

enum ConnectionStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
  ACCEPTED = "accepted",
}

enum ConnectionHistoryType {
  CREDENTIAL_ACCEPTED,
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
  basicStorage: BasicStorage;
  signifyClient: SignifyClient;
  eventService: EventService;
  identifierStorage: IdentifierStorage;
  credentialStorage: CredentialStorage;
}

enum MultiSigRoute {
  ROT = "/multisig/rot",
  ICP = "/multisig/icp",
  IXN = "/multisig/ixn",
}

interface CreateIdentifierResult {
  signifyName: string;
  identifier: string;
}

interface KeriaContact {
  alias: string;
  id: string;
  oobi: string;
  challenges: string[];
  wellKnowns: string[];
}

interface IdentifierResult {
  name: string;
  prefix: string;
  salty: any;
}

interface IdentifiersListResult {
  aids: IdentifierResult[];
  start: 0;
  end: 0;
  total: 0;
}

interface CreateMultisigExnPayload {
  gid: string;
  smids: any[];
  rmids: any;
  rstates: any;
  name: string;
}

interface Aid {
  name: string;
  prefix: string;
  salty: any;
  transferable: boolean;
  state: {
    vn: number[];
    i: string;
    s: string;
    p: string;
    d: string;
    f: string;
    dt: string;
    et: string;
    kt: string;
    k: string[];
    nt: string;
    n: string[];
    bt: string;
    b: string[];
    c: string[];
    ee: {
      s: string;
      d: string;
      br: any[];
      ba: any[];
    };
    di: string;
  };
  windexes: number[];
}

interface MultiSigExnMessage {
  exn: {
    v: string;
    t: string;
    d: string;
    i: string;
    p: string;
    dt: string;
    r: string;
    q: any;
    a: {
      gid: string;
      smids: string[];
      rmids: string[];
      rstates: Aid["state"][];
      name: string;
    };
    e: {
      icp: {
        v: string;
        t: string;
        d: string;
        i: string;
        s: string;
        kt: string;
        k: string[];
        nt: string;
        n: string[];
        bt: string;
        b: string[];
        c: any[];
        a: any[];
      };
      d: string;
    };
  };
}

enum NotificationRoute {
  Credential = "/exn/ipex/grant",
  MultiSigIcp = "/multisig/icp",
  MultiSigRot = "/multisig/rot",
}

export {
  ConnectionStatus,
  ConnectionHistoryType,
  MiscRecordId,
  ConnectionEventTypes,
  AcdcEventTypes,
  NotificationRoute,
  MultiSigRoute,
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
  KeriaContact,
  IdentifiersListResult,
  CreateMultisigExnPayload,
  MultiSigExnMessage,
  Aid,
  IdentifierResult,
};
