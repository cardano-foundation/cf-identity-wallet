import { IpexMessage } from "../agent.types";

enum KeriaContactKeyPrefix {
  CONNECTION_NOTE = "note:",
  HISTORY_IPEX = "history:ipex:",
  HISTORY_REVOKE = "history:revoke:",
}

interface ConnectionHistoryItem {
  id: string;
  credentialType: string;
  historyType: ConnectionHistoryType;
  dt: string;
  connectionId: string;
}

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
  CREDENTIAL_REVOKED,
  CREDENTIAL_PRESENTED
}

export { ConnectionHistoryType, KeriaContactKeyPrefix };

export type { KeriaContact, ConnectionHistoryItem, IpexMessage };