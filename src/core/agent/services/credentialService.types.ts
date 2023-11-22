import { JsonCredential } from "@aries-framework/core";
import { CredentialMetadataRecordProps } from "../modules/generalStorage/repositories/credentialMetadataRecord.types";

enum CredentialStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
}

type CredentialShortDetails = Omit<
  CredentialMetadataRecordProps,
  "credentialRecordId"
>;

interface CredentialDetails extends CredentialShortDetails {
  type: string[];
  connectionId?: string;
  expirationDate?: string;
  credentialSubject: JsonCredential["credentialSubject"];
  proofType: string;
  proofValue?: string;
}

interface CredentialDetails extends CredentialShortDetails {
  type: string[];
  connectionId?: string;
  expirationDate?: string;
  credentialSubject: JsonCredential["credentialSubject"];
  proofType: string;
  proofValue?: string;
}

interface Notification {
  i: string;
  dt: string;
  r: boolean;
  a: {
    r: string;
    d: string;
    m: string;
  };
}

export { CredentialStatus };
export type { CredentialShortDetails, CredentialDetails, Notification };
