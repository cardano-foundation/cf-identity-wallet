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
}

interface CredentialMetadataRecordExtraProps
  extends CredentialMetadataRecordProps {
  degreeType?: string;
  expirationDate?: string;
  image?: string;
  givenName?: string;
  familyName?: string;
  birthCountry?: string;
  lprCategory?: string;
  residentSince?: string;
  summitType?: string;
  startDate?: string;
  endDate?: string;
  passId?: string;
}

export { CredentialMetadataRecordStatus };
export type {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordExtraProps,
};
