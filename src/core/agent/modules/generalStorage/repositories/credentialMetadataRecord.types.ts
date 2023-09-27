enum CredentialMetadataRecordStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
}
interface CredentialMetadataRecordProps {
  id: string;
  nameOnCredential: string;
  colors: [string, string];
  createdAt?: Date;
  isArchived?: boolean;
  issuanceDate: string;
  issuerLogo?: string;
  credentialType: string;
  credentialRecordId: string;
  status: CredentialMetadataRecordStatus;
}

export { CredentialMetadataRecordStatus };
export type { CredentialMetadataRecordProps };
