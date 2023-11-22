import { IdentifierShortDetails } from "../../../core/agent/services/identifierService.types";

interface IdentityCardTemplateProps {
  name?: string;
  cardData: IdentifierShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

export type { IdentityCardTemplateProps };
