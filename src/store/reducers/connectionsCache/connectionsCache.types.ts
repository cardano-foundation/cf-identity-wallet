import { ConnectionShortDetails } from "../../../core/agent/agent.types";

interface MissingAliasConnection {
  url: string;
  identifier?: string;
}
interface ConnectionsCacheState {
  connections: { [key: string]: ConnectionShortDetails };
  multisigConnections: { [key: string]: ConnectionShortDetails };
  openConnectionId?: string;
  missingAliasUrl?: MissingAliasConnection;
}

export type { ConnectionsCacheState, MissingAliasConnection };
