import { BaseEvent } from "@aries-framework/core";
import { IdentifierMetadataRecordProps } from "./modules";
import { CredentialStatus } from "./services/credentialService.types";

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

type UpdateIdentityMetadata = Omit<
  Partial<IdentifierMetadataRecordProps>,
  "id" | "isArchived" | "name" | "method" | "createdAt"
>;

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
  payload: {
    credentialId: string;
    status: CredentialStatus;
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
};
