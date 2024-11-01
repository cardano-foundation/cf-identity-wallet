import { IdentifierDetails } from "../../../../core/agent/services/identifier.types";
import { DetailView } from "./IdetifierDetailModal/IdentifierDetailModal.types";

interface IdentifierContentProps {
  cardData: IdentifierDetails;
  openPropDetailModal: (view: DetailView) => void;
}

export type { IdentifierContentProps };
