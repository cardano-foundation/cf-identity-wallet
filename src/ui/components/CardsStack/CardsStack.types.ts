import {
  IdentifierShortDetails,
  CredentialShortDetails,
} from "../../../core/agent/agent.types";

interface DidCardProps {
  name?: string;
  cardData: IdentifierShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

interface CredCardProps {
  name?: string;
  cardData: CredentialShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

export type { DidCardProps, CredentialShortDetails, CredCardProps };
