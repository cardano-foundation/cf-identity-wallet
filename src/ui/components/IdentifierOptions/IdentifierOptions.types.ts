import { KERIDetails } from "../../../core/agent/services/identifier.types";

interface IdentifierOptionsProps {
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  cardData: KERIDetails;
  setCardData: (value: KERIDetails) => void;
  handleDeleteIdentifier: () => Promise<void>;
}

export type { IdentifierOptionsProps };
