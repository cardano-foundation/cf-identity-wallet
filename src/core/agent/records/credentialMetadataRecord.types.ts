import { CredentialStatus } from "../services/credentialService.types";
import { IdentifierType } from "../services/identifier.types";

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
  identifierId: string;
  identifierType: IdentifierType;
}

export type { CredentialMetadataRecordProps };
