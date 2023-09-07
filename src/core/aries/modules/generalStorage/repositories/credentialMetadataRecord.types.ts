interface CredentialMetadataRecordProps {
  id: string;
  nameOnCredential: string;
  colors: [string, string];
  createdAt?: Date;
  isArchived?: boolean;
  issuanceDate: string;
  issuerLogo: string;
  credentialType: string;
}

export type { CredentialMetadataRecordProps };
