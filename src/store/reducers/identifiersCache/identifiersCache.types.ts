import { ConnectionShortDetails } from "../../../core/agent/agent.types";

interface FavouriteIdentifier {
  id: string;
  time: number;
}

interface MultiSigGroup {
  groupId: string;
  connections: ConnectionShortDetails[];
}

export type { FavouriteIdentifier, MultiSigGroup };
