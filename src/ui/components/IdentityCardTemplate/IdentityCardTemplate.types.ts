import { IdentifierShortDetails } from "../../../core/agent/agent.types";

interface IdentityCardTemplateProps {
  cardData: IdentifierShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

export type { IdentityCardTemplateProps };
