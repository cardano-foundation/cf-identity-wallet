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

interface W3CCredentialDetails extends CredentialShortDetails {
  type: string[];
  connectionId?: string;
  expirationDate?: string;
  credentialSubject: JsonCredential["credentialSubject"];
  proofType: string;
  proofValue?: string;
}

interface ACDCDetails extends CredentialShortDetails {
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
export type {
  CredentialShortDetails,
  W3CCredentialDetails,
  ACDCDetails,
  Notification,
};
