interface KeriaContact {
  alias: string;
  id: string;
  oobi: string;
  challenges: string[];
  wellKnowns: string[];
}

enum ConnectionHistoryType {
  CREDENTIAL_ISSUANCE,
  CREDENTIAL_REQUEST_PRESENT,
  CREDENTIAL_REQUEST_AGREE,
  CREDENTIAL_UPDATE,
}

export { ConnectionHistoryType };

export type { KeriaContact };
