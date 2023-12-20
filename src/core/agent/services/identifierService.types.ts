enum IdentifierType {
  KEY = "key",
  KERI = "keri",
}

interface IdentifierShortDetails {
  id: string;
  method: IdentifierType;
  displayName: string;
  createdAtUTC: string;
  signifyName?: string;
  colors: [string, string];
  theme: number;
}

type GetIdentifierResult =
  | { type: IdentifierType.KERI; result: KERIDetails }
  | { type: IdentifierType.KEY; result: DIDDetails };

interface DIDDetails extends IdentifierShortDetails {
  keyType: string;
  controller: string;
  publicKeyBase58: string;
}

interface KERIDetails extends IdentifierShortDetails {
  opName?: string;
  isPending?: boolean;
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

export { IdentifierType };

export type {
  IdentifierShortDetails,
  DIDDetails,
  KERIDetails,
  GetIdentifierResult,
};
