import { BaseEvent } from "@aries-framework/core";
import { IdentifierMetadataRecordProps } from "./modules";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "./services/credentialService.types";

enum Blockchain {
  CARDANO = "Cardano",
}

enum ConnectionStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
}

enum GenericRecordType {
  CONNECTION_NOTE = "connection-note",
  CONNECTION_KERI_METADATA = "connection-keri-metadata",
  NOTIFICATION_KERI = "notification-keri",
  IPEX_MESSAGE = "ipex-message",
}

enum ConnectionHistoryType {
  CREDENTIAL_ACCEPTED,
}

enum ConnectionType {
  DIDCOMM,
  KERI,
}

interface ConnectionHistoryItem {
  type: ConnectionHistoryType;
  credentialType?: string;
  timestamp: string;
}

enum MiscRecordId {
  OP_PASS_HINT = "app-op-password-hint",
}

interface CryptoAccountRecordShortDetails {
  id: string;
  displayName: string;
  blockchain: Blockchain;
  totalADAinUSD: number;
  usesIdentitySeedPhrase: boolean;
}

interface ConnectionShortDetails {
  id: string;
  label: string;
  connectionDate: string;
  logo?: string;
  status: ConnectionStatus;
  type?: ConnectionType;
  oobi?: string;
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
  goalCode?: string;
  handshakeProtocols?: string[];
  requestAttachments?: string[];
  serviceEndpoints?: string[];
  notes?: ConnectionNoteDetails[];
  linkedIpexMessages?: IpexMessageDetails[];
}

enum CredentialType {
  UNIVERSITY_DEGREE_CREDENTIAL = "UniversityDegreeCredential",
  ACCESS_PASS_CREDENTIAL = "AccessPassCredential",
  PERMANENT_RESIDENT_CARD = "PermanentResidentCard",
}

enum ConnectionKeriEventTypes {
  ConnectionKeriStateChanged = "ConnectionKeriStateChanged",
}
enum AcdcKeriEventTypes {
  AcdcKeriStateChanged = "AcdcKeriStateChanged",
}
interface ConnectionKeriStateChangedEvent extends BaseEvent {
  type: typeof ConnectionKeriEventTypes.ConnectionKeriStateChanged;
  payload: {
    connectionId?: string;
    status: ConnectionStatus;
  };
}

interface AcdcKeriStateChangedEvent extends BaseEvent {
  type: typeof AcdcKeriEventTypes.AcdcKeriStateChanged;
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

interface KeriNotification {
  id: string;
  createdAt: Date;
  a: Record<string, unknown>;
}

export {
  Blockchain,
  ConnectionStatus,
  GenericRecordType,
  ConnectionHistoryType,
  MiscRecordId,
  ConnectionType,
  CredentialType,
  ConnectionKeriEventTypes,
  AcdcKeriEventTypes,
};
export type {
  CryptoAccountRecordShortDetails,
  ConnectionShortDetails,
  ConnectionDetails,
  ConnectionNoteDetails,
  ConnectionNoteProps,
  ConnectionHistoryItem,
  ConnectionKeriStateChangedEvent,
  KeriNotification,
  AcdcKeriStateChangedEvent,
  IpexMessages,
  IpexMessageDetails,
};
