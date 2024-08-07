enum CredentialMetadataRecordStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
}

interface CredentialMetadataRecordProps {
  id: string;
  createdAt?: Date;
  isArchived?: boolean;
  isDeleted?: boolean;
  issuanceDate: string;
  credentialType: string;
  status: CredentialMetadataRecordStatus;
  connectionId: string;
  schema: string;
}

export { CredentialMetadataRecordStatus };
export type { CredentialMetadataRecordProps };
