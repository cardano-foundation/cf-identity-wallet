import { DIDDetails, KERIDetails } from "../../../core/agent/agent.types";

interface IdentityOptionsProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  cardData: KERIDetails | DIDDetails;
  setCardData: (value: KERIDetails | DIDDetails) => void;
}

export type { IdentityOptionsProps };
