import { DIDDetails } from "../../../core/aries/ariesAgent.types";

interface IdentityCardInfoKeyProps {
  cardData: DIDDetails;
  setShowToast: (value: boolean) => void;
}

export type { IdentityCardInfoKeyProps };
