import { IdentityDetails } from "../../../core/aries/ariesAgent.types";

interface EditIdentityProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  cardData: IdentityDetails;
  setCardData: (value: IdentityDetails) => void;
}

export type { EditIdentityProps };
