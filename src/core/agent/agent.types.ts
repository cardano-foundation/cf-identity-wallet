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

enum ConnectionKeriEventTypes {
  ConnectionKeriStateChanged = "ConnectionKeriStateChanged",
}
enum AcdcKeriEventTypes {
  AcdcKeriStateChanged = "AcdcKeriStateChanged",
}
interface ConnectionKeriStateChangedEvent extends BaseEventEmitter {
  type: typeof ConnectionKeriEventTypes.ConnectionKeriStateChanged;
  payload: {
    connectionId?: string;
    status: ConnectionStatus;
  };
}

interface AcdcKeriStateChangedEvent extends BaseEventEmitter {
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

interface BaseEventEmitter {
  type: string;
  payload: Record<string, unknown>;
}

interface KeriaNotificationMarker {
  nextIndex: number;
  lastNotificationId: string;
}

export {
  Blockchain,
  ConnectionStatus,
  ConnectionHistoryType,
  MiscRecordId,
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
  BaseEventEmitter,
  KeriaNotificationMarker,
};
