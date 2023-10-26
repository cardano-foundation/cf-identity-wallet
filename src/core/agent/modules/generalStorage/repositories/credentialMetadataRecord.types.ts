enum CredentialMetadataRecordStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
}
interface CredentialMetadataRecordProps {
  id: string;
  colors: [string, string];
  createdAt?: Date;
  isArchived?: boolean;
  issuanceDate: string;
  issuerLogo?: string;
  credentialType: string;
  credentialRecordId: string;
  status: CredentialMetadataRecordStatus;
  connectionId?: string;
  credentialSubjectType?: string;
}

export { CredentialMetadataRecordStatus };
export type { CredentialMetadataRecordProps };
