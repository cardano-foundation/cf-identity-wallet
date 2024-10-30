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

enum ConnectionHistoryType {
  CREDENTIAL_ISSUANCE,
  CREDENTIAL_REQUEST_PRESENT,
  CREDENTIAL_REQUEST_AGREE,
  CREDENTIAL_REVOKED,
}

export { ConnectionHistoryType, KeriaContactKeyPrefix };

export type { ConnectionHistoryItem, IpexMessage };
