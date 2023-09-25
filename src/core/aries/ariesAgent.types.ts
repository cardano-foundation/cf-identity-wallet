import { IdentityMetadataRecordProps } from "./modules/generalStorage/repositories/identityMetadataRecord";

enum IdentityType {
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

interface IdentityShortDetails {
  id: string;
  method: IdentityType;
  displayName: string;
  createdAtUTC: string;
  colors: [string, string];
}

interface CredentialShortDetails {
  id: string;
  nameOnCredential: string;
  colors: [string, string];
  issuanceDate: string;
  issuerLogo: string;
  credentialType: string;
}

interface ConnectionShortDetails {
  id: string;
  issuer: string;
  issuanceDate: string;
  issuerLogo: string;
  status: ConnectionStatus;
}

interface DIDDetails extends IdentityShortDetails {
  keyType: string;
  controller: string;
  publicKeyBase58: string;
}

interface KERIDetails extends IdentityShortDetails {
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

type GetIdentityResult =
  | { type: IdentityType.KERI; result: KERIDetails }
  | { type: IdentityType.KEY; result: DIDDetails };

type UpdateIdentityMetadata = Omit<
  Partial<IdentityMetadataRecordProps>,
  "id" | "isArchived" | "name" | "method" | "createdAt"
>;

export { IdentityType, Blockchain, ConnectionStatus };
export type {
  CryptoAccountRecordShortDetails,
  IdentityShortDetails,
  DIDDetails,
  KERIDetails,
  GetIdentityResult,
  UpdateIdentityMetadata,
  CredentialShortDetails,
  ConnectionShortDetails,
  ConnectionDetails,
};
