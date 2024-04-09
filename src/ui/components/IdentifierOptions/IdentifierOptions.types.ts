import { IdentifierDetails } from "../../../core/agent/services/identifierService.types";

interface IdentifierOptionsProps {
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  cardData: IdentifierDetails;
  setCardData: (value: IdentifierDetails) => void;
  handleDeleteIdentifier: () => Promise<void>;
}

export type { IdentifierOptionsProps };
