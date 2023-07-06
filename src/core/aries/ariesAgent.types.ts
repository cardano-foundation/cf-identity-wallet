enum IdentityType {
  KEY = "key",
  KERI = "keri",
}

interface IdentityShortDetails {
  method: IdentityType;
  displayName: string;
  id: string;
  createdAtUTC: string;
  colors: [string, string];
}

interface IdentityDetails {
  method: IdentityType;
  displayName: string;
  id: string;
  createdAtUTC: string;
  controller: string;
  keyType: string;
  publicKeyBase58: string;
  colors: [string, string];
}

export { IdentityType };
export type { IdentityShortDetails, IdentityDetails };
