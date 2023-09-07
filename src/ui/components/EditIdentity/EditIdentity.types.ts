import { DIDDetails, KERIDetails } from "../../../core/aries/ariesAgent.types";

interface EditIdentityProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  cardData: KERIDetails | DIDDetails;
  setCardData: (value: KERIDetails | DIDDetails) => void;
}

export type { EditIdentityProps };
