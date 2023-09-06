import { DIDDetails } from "../../../core/aries/ariesAgent.types";

interface DidCardInfoKeyProps {
  cardData: DIDDetails;
  setShowToast: (value: boolean) => void;
}

export type { DidCardInfoKeyProps };
