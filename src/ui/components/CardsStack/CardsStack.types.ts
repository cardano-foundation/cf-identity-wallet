interface DidProps {
  id: string;
  type: string;
  name: string;
  date: string;
  colors: string[];
  keyType?: string;
  controller?: string;
  publicKeyBase58?: string;
}

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
  colors: string[];
}

interface DidCardProps {
  cardData: DidProps;
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

export type { DidProps, DidCardProps, CredProps, CredCardProps };
