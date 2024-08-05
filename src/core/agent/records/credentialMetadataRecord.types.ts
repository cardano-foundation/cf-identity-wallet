enum CredentialMetadataRecordStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
  REVOKED = "revoked",
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
}

export { CredentialMetadataRecordStatus };
export type { CredentialMetadataRecordProps };
