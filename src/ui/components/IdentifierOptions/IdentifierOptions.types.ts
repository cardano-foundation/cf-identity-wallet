import { IdentifierFullDetails } from "../../../core/agent/services/identifierService.types";

interface IdentifierOptionsProps {
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  cardData: IdentifierFullDetails;
  setCardData: (value: IdentifierFullDetails) => void;
  handleDeleteIdentifier: () => void;
}

export type { IdentifierOptionsProps };
