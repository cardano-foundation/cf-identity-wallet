import { ConnectionType } from "../../../agent.types";

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
  cachedDetails?:
    | UniversityCredCachedDetails
    | ResidencyCredCachedDetails
    | SummitCredCachedDetails;
  connectionType: ConnectionType;
}

interface UniversityCredCachedDetails {
  degreeType: string;
}

interface ResidencyCredCachedDetails {
  expirationDate: string;
  image: string;
  givenName: string;
  familyName: string;
  birthCountry: string;
  lprCategory: string;
  residentSince: string;
}

interface SummitCredCachedDetails {
  summitType: string;
  startDate: string;
  endDate: string;
  passId: string;
}

export { CredentialMetadataRecordStatus };
export type {
  CredentialMetadataRecordProps,
  UniversityCredCachedDetails,
  ResidencyCredCachedDetails,
  SummitCredCachedDetails,
};
