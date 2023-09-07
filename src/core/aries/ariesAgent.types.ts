import { NetworkType } from "../cardano/addresses.types";
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

interface CredentialShortDetails {
  id: string;
  nameOnCredential: string;
  colors: [string, string];
  issuanceDate: string;
  issuerLogo: string;
  credentialType: string;
}

interface DIDDetails extends IdentityShortDetails {
  controller: string;
  keyType: string;
  publicKeyBase58: string;
}

interface KERIDetails extends IdentityShortDetails {
  sequenceNumber: number;
  priorEventSaid: string;
  eventSaid: string;
  eventTimestamp: Date;
  eventType: string;
  keySigningThreshold: number;
  signingKeys: string[];
  nextKeysThreshold: string[];
  nextKeys: string[];
  backerThreshold: number;
  backerAids: string[];
  lastEstablishmentEvent: {
    said: string;
    sequence: string;
    backerToRemove: string[];
    backerToAdd: string[];
  };
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
  CredentialShortDetails,
};
