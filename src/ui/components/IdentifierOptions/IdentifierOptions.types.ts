import {
  DIDDetails,
  KERIDetails,
} from "../../../core/agent/services/identifierService.types";

interface IdentifierOptionsProps {
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  cardData: KERIDetails | DIDDetails;
  setCardData: (value: KERIDetails | DIDDetails) => void;
}

export type { IdentifierOptionsProps };
