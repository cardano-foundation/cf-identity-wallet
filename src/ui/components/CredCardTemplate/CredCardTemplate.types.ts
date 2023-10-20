import { CredentialShortDetails } from "../../../core/agent/agent.types";

interface CredCardTemplateProps {
  cardData: CredentialShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

export type { CredCardTemplateProps };
