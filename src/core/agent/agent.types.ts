import { IdentifierMetadataRecordProps } from "./modules/generalStorage/repositories/identifierMetadataRecord";
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

interface ConnectionDetails extends ConnectionShortDetails {
  goalCode?: string;
  handshakeProtocols?: string[];
  requestAttachments?: string[];
  serviceEndpoints?: string[];
}

interface CredentialDetails extends CredentialShortDetails {
  type: string[];
  connection?: string;
  expirationDate?: string;
  receivingDid?: string;
  credentialSubject: any;
  proofType: string;
  proofValue: string;
}

type GetIdentifierResult =
  | { type: IdentifierType.KERI; result: KERIDetails }
  | { type: IdentifierType.KEY; result: DIDDetails };

type UpdateIdentityMetadata = Omit<
  Partial<IdentifierMetadataRecordProps>,
  "id" | "isArchived" | "name" | "method" | "createdAt"
>;

export { IdentifierType, Blockchain, ConnectionStatus };
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
};
