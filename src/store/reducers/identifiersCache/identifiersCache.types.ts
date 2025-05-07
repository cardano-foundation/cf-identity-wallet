import { ConnectionShortDetails } from "../../../core/agent/agent.types";
import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { IdentifiersFilters } from "../../../ui/pages/Identifiers/Identifiers.types";

interface FavouriteIdentifier {
  id: string;
  time: number;
}

interface MultiSigGroup {
  groupId: string;
  connections: ConnectionShortDetails[];
}

interface IdentifierCacheState {
  identifiers: Record<string, IdentifierShortDetails>;
  favourites: FavouriteIdentifier[];
  filters: IdentifiersFilters;
  multiSigGroup: MultiSigGroup | undefined;
  openMultiSigId?: string;
  scanGroupId?: string;
  individualFirstCreate?: boolean;
}

export type { FavouriteIdentifier, MultiSigGroup, IdentifierCacheState };
