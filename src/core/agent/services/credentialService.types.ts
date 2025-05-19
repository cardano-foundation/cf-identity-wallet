import { CredentialMetadataRecordProps } from "../records/credentialMetadataRecord.types";

enum CredentialStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
  REVOKED = "revoked",
}

type CredentialShortDetails = Omit<CredentialMetadataRecordProps, "createdAt">;

interface ACDCDetails
  extends Omit<CredentialShortDetails, "credentialType" | "issuanceDate"> {
  i: string;
  a: {
    i: string;
    dt: string;
    [key: string]: unknown;
  };
  s: {
    title: string;
    description: string;
    version: string;
  };
  lastStatus: {
    s: "0" | "1";
    dt: string;
  };
}

export { CredentialStatus };
export type { CredentialShortDetails, ACDCDetails };
