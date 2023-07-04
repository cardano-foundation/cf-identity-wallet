enum IdentityType {
  KEY = "key",
  KERI = "keri",
}

interface IdentityShortDetails {
  method: IdentityType;
  displayName: string;
  id: string;
  createdAtUTC: string;
  colours: [string, string];
}

interface IdentityDetails {
  method: IdentityType;
  displayName: string;
  id: string;
  createdAtUTC: string;
  controller: string;
  keyType: string;
  publicKeyBase58: string;
  colours: [string, string];
}

export { IdentityType };
export type { IdentityShortDetails, IdentityDetails };
