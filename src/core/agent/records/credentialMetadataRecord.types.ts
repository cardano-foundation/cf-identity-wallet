import { CredentialStatus } from "../services/credentialService.types";
import { IdentifierType } from "../services/identifier.types";
import { IdentifierMetadataRecordProps } from "./identifierMetadataRecord";

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
  identifier: IdentifierMetadataRecordProps;
  identifierType: IdentifierType;
}

export type { CredentialMetadataRecordProps };
