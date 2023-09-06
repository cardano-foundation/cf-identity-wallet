import { IdentityMetadataRecordProps } from "./modules/generalStorage/repositories/identityMetadataRecord";

enum IdentityType {
  KEY = "key",
  KERI = "keri",
}

enum Blockchain {
  CARDANO = "Cardano",
}

interface CryptoAccountRecordShortDetails {
  id: string;
  displayName: string;
  blockchain: Blockchain;
  totalADAinUSD: number;
  usesIdentitySeedPhrase: boolean;
}

interface IdentityShortDetails {
  method: IdentityType;
  displayName: string;
  id: string;
  createdAtUTC: string;
  colors: [string, string];
}

interface DIDDetails extends IdentityShortDetails {
  controller: string;
  keyType: string;
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

type GetIdentityResult =
  | { type: IdentityType.KERI; result: KERIDetails }
  | { type: IdentityType.KEY; result: DIDDetails };

type UpdateIdentityMetadata = Omit<
  Partial<IdentityMetadataRecordProps>,
  "id" | "isArchived" | "name" | "method" | "createdAt"
>;

export { IdentityType, Blockchain };
export type {
  CryptoAccountRecordShortDetails,
  IdentityShortDetails,
  DIDDetails,
  KERIDetails,
  GetIdentityResult,
  UpdateIdentityMetadata,
};
