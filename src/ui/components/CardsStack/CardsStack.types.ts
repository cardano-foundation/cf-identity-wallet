import { IdentityShortDetails } from "../../../core/aries/ariesAgent.types";

interface CredProps {
  id: string;
  type?: string[];
  connection?: string;
  issuanceDate: string;
  expirationDate?: string;
  receivingDid?: string;
  credentialType: string;
  nameOnCredential: string;
  issuerLogo: string;
  credentialSubject?: {
    degree: {
      education: string;
      type: string;
      name: string;
    };
  };
  proofType?: string;
  proofValue?: string;
  credentialStatus?: {
    revoked: boolean;
    suspended: boolean;
  };
  status: string;
  colors: string[];
}

interface DidCardProps {
  cardData: IdentityShortDetails;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

interface CredCardProps {
  cardData: CredProps;
  isActive: boolean;
  index?: number;
  onHandleShowCardDetails?: (index: number | undefined) => void;
}

export type { DidCardProps, CredProps, CredCardProps };
