import { BaseEvent, JsonCredential } from "@aries-framework/core";
import { CredentialMetadataRecordProps } from "./modules/generalStorage/repositories/credentialMetadataRecord.types";

enum IdentifierType {
  KEY = "key",
  KERI = "keri",
}

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

interface IdentifierShortDetails {
  id: string;
  method: IdentifierType;
  displayName: string;
  createdAtUTC: string;
  colors: [string, string];
  theme: number;
}

type CredentialShortDetails = Omit<
  CredentialMetadataRecordProps,
  "credentialRecordId"
>;

interface ConnectionShortDetails {
  id: string;
  label: string;
  connectionDate: string;
  logo?: string;
  status: ConnectionStatus;
  type?: ConnectionType;
}

interface DIDDetails extends IdentifierShortDetails {
  keyType: string;
  controller: string;
  publicKeyBase58: string;
}

interface KERIDetails extends IdentifierShortDetails {
  s: number;
  dt: string;
  kt: number;
  k: string[];
  nt: number;
  n: string[];
  bt: number;
  b: string[];
  di: string;
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

interface CredentialDetails extends CredentialShortDetails {
  type: string[];
  connectionId?: string;
  expirationDate?: string;
  credentialSubject: JsonCredential["credentialSubject"];
  proofType: string;
  proofValue?: string;
}

enum CredentialType {
  UNIVERSITY_DEGREE_CREDENTIAL = "UniversityDegreeCredential",
  ACCESS_PASS_CREDENTIAL = "AccessPassCredential",
  PERMANENT_RESIDENT_CARD = "PermanentResidentCard",
}

type GetIdentifierResult =
  | { type: IdentifierType.KERI; result: KERIDetails }
  | { type: IdentifierType.KEY; result: DIDDetails };

enum ConnectionKeriEventTypes {
  ConnectionKeriStateChanged = "ConnectionKeriStateChanged",
}
interface ConnectionKeriStateChangedEvent extends BaseEvent {
  type: typeof ConnectionKeriEventTypes.ConnectionKeriStateChanged;
  payload: {
    connectionId?: string;
    status: ConnectionStatus;
  };
}

export {
  IdentifierType,
  Blockchain,
  ConnectionStatus,
  GenericRecordType,
  ConnectionHistoryType,
  MiscRecordId,
  ConnectionType,
  CredentialType,
  ConnectionKeriEventTypes,
};
export type {
  CryptoAccountRecordShortDetails,
  IdentifierShortDetails,
  DIDDetails,
  KERIDetails,
  GetIdentifierResult,
  CredentialShortDetails,
  CredentialDetails,
  ConnectionShortDetails,
  ConnectionDetails,
  ConnectionNoteDetails,
  ConnectionNoteProps,
  ConnectionHistoryItem,
  ConnectionKeriStateChangedEvent,
};
