import { ConnectionType } from "../agent.types";

enum CredentialMetadataRecordStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
}
interface CredentialMetadataRecordProps {
  id: string;
  colors: [string, string];
  createdAt?: Date;
  isArchived?: boolean;
  isDeleted?: boolean;
  issuanceDate: string;
  issuerLogo?: string;
  credentialType: string;
  credentialRecordId: string;
  status: CredentialMetadataRecordStatus;
  connectionId?: string;
  connectionType: ConnectionType;
}

export { CredentialMetadataRecordStatus };
export type { CredentialMetadataRecordProps };
