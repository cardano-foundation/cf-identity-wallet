import { IdentifierDetails } from "../../../../core/agent/services/identifier.types";

interface IdentifierContentProps {
  cardData: IdentifierDetails;
  rotateKeys: () => Promise<void>;
}

export type { IdentifierContentProps };
