import { IdentifierFullDetails } from "../../../../core/agent/services/identifierService.types";

export interface IdentifierJsonModalProps {
  cardData: IdentifierFullDetails;
  isOpen: boolean;
  onDissmiss: () => void;
}
