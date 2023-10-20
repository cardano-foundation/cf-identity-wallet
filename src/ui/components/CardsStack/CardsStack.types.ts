import { CredentialShortDetails } from "../../../core/agent/agent.types";

interface CredCardProps {
  cardData: CredentialShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

export type { CredentialShortDetails, CredCardProps };
