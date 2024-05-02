import { IdentifierDetails } from "../../../../core/agent/services/identifier.types";

export interface IdentifierJsonModalProps {
  cardData: IdentifierDetails;
  isOpen: boolean;
  onDissmiss: () => void;
}
