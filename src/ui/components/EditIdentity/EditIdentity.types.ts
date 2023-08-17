import { DIDDetails } from "../../../core/aries/ariesAgent.types";

interface EditIdentityProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  cardData: DIDDetails;
  setCardData: (value: DIDDetails) => void;
}

export type { EditIdentityProps };
