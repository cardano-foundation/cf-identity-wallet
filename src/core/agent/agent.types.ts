import { IdentifierMetadataRecordProps } from "./modules/generalStorage/repositories/identifierMetadataRecord";

enum IdentifierType {
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

interface IdentifierShortDetails {
  method: IdentifierType;
  displayName: string;
  id: string;
  createdAtUTC: string;
  colors: [string, string];
}

interface DIDDetails extends IdentifierShortDetails {
  controller: string;
  keyType: string;
  publicKeyBase58: string;
}

interface KERIDetails extends IdentifierShortDetails {
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

type GetIdentifierResult =
  | { type: IdentifierType.KERI; result: KERIDetails }
  | { type: IdentifierType.KEY; result: DIDDetails };

type UpdateIdentifierMetadata = Omit<
  Partial<IdentifierMetadataRecordProps>,
  "id" | "isArchived" | "name" | "method" | "createdAt"
>;

export { IdentifierType, Blockchain };
export type {
  CryptoAccountRecordShortDetails,
  IdentifierShortDetails,
  DIDDetails,
  KERIDetails,
  GetIdentifierResult,
  UpdateIdentifierMetadata,
};
