interface KeriaContact {
  alias: string;
  id: string;
  oobi: string;
  challenges: string[];
  wellKnowns: string[];
}

enum ConnectionHistoryType {
  CREDENTIAL_ACCEPTED,
}

export { ConnectionHistoryType };

export type { KeriaContact };
