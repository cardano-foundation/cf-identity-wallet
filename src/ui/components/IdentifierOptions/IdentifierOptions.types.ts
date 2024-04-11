import { IdentifierFullDetails } from "../../../core/agent/services/identifier.types";

interface IdentifierOptionsProps {
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  cardData: IdentifierFullDetails;
  setCardData: (value: IdentifierFullDetails) => void;
  handleDeleteIdentifier: () => Promise<void>;
}

export type { IdentifierOptionsProps };
