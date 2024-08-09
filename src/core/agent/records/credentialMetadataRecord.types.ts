import { CredentialStatus } from "../services/credentialService.types";

interface CredentialMetadataRecordProps {
  id: string;
  createdAt?: Date;
  isArchived?: boolean;
  isDeleted?: boolean;
  issuanceDate: string;
  credentialType: string;
  status: CredentialStatus;
  connectionId: string;
  schema: string;
}

export type { CredentialMetadataRecordProps };
