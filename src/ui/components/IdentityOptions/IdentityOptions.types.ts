import { DIDDetails, KERIDetails } from "../../../core/agent/agent.types";

interface IdentityOptionsProps {
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  cardData: KERIDetails | DIDDetails;
  setCardData: (value: KERIDetails | DIDDetails) => void;
}

export type { IdentityOptionsProps };
