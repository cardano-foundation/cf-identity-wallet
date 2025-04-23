import { ExnMessage } from "../agent.types";

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
  CREDENTIAL_REVOKED,
  CREDENTIAL_PRESENTED,
  IPEX_AGREE_COMPLETE,
}

enum RpyRoute {
  INTRODUCE = "/introduce",
}

enum OobiQueryParams {
  NAME = "name",
  GROUP_ID = "groupId",
  ROLE = "role",
  EXTERNAL_ID = "externalId",
}

export {
  ConnectionHistoryType,
  KeriaContactKeyPrefix,
  RpyRoute,
  OobiQueryParams,
};

export type { ConnectionHistoryItem, ExnMessage };
