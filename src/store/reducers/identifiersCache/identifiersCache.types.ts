import { ConnectionShortDetails } from "../../../core/agent/agent.types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";

interface FavouriteIdentifier {
  id: string;
  time: number;
}

interface MultiSigGroup {
  groupId: string;
  connections: ConnectionShortDetails[];
}

interface IdentifierCacheState {
  identifiers: IdentifierShortDetails[];
  favourites: FavouriteIdentifier[];
  multiSigGroup: MultiSigGroup | undefined;
  openMultiSigId?: string;
  scanGroupId?: string;
}

export type { FavouriteIdentifier, MultiSigGroup, IdentifierCacheState };
