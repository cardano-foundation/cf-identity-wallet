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

interface ExternalLink {
  t: string;
  a: string;
}

interface HumanReadableMessage {
  t: string;
  st: string;
  c: string[];
  l?: ExternalLink;
}

export {
  ConnectionHistoryType,
  KeriaContactKeyPrefix,
  RpyRoute,
  OobiQueryParams,
};

export type {
  ConnectionHistoryItem,
  ExnMessage,
  ExternalLink,
  HumanReadableMessage,
};
