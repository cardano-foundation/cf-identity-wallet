import {
  IdentifierShortDetails,
  CredentialShortDetails,
} from "../../../core/agent/agent.types";

interface DidCardProps {
  cardData: IdentifierShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

interface CredCardProps {
  cardData: CredentialShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

export type { DidCardProps, CredentialShortDetails, CredCardProps };
