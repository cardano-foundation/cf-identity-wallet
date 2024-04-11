import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";

interface CredentialCardTemplateProps {
  name?: string;
  cardData: CredentialShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
  pickedCard?: boolean;
}

export type { CredentialCardTemplateProps };
