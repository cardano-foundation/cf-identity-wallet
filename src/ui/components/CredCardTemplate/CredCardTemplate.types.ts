import { CredentialShortDetails } from "../../../core/agent/agent.types";

interface CredCardTemplateProps {
  name?: string;
  shortData: CredentialShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

export type { CredCardTemplateProps };
