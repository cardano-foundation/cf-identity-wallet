import { ConnectionShortDetails } from "../../../core/agent/agent.types";

interface ConnectionsCacheState {
  connections: { [key: string]: ConnectionShortDetails };
  multisigConnections: { [key: string]: ConnectionShortDetails };
  openConnectionId?: string;
  missingAliasUrl?: string;
}

export type { ConnectionsCacheState };
