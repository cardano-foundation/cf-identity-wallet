import { IdentifierDetails } from "../../../core/agent/services/identifier.types";

interface IdentifierOptionsProps {
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  cardData: IdentifierDetails;
  setCardData: (value: IdentifierDetails) => void;
  handleDeleteIdentifier: () => void;
  handleRotateKey: () => void;
  oobi: string;
  restrictedOptions?: boolean;
}

export type { IdentifierOptionsProps };
