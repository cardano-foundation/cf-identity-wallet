import { IdentifierDetails } from "../../../../core/agent/services/identifier.types";

interface IdentifierContentProps {
  cardData: IdentifierDetails;
  onRotateKey: () => void;
}

export type { IdentifierContentProps };
