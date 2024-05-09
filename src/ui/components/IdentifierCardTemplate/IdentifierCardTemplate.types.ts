import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";

interface IdentifierCardTemplateProps {
  name?: string;
  cardData: IdentifierShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
  pickedCard?: boolean;
}

export type { IdentifierCardTemplateProps };
