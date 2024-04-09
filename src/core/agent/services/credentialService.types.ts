import { CredentialMetadataRecordProps } from "../records/credentialMetadataRecord.types";

enum CredentialStatus {
  CONFIRMED = "confirmed",
  PENDING = "pending",
}

type CredentialShortDetails = Omit<
  CredentialMetadataRecordProps,
  "credentialRecordId" | "connectionId" | "createdAt" | "issuerLogo"
>;

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

interface JSONObject {
  [x: string]: JSONValue;
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
  ACDCDetails,
  Notification,
  JSONObject,
  JSONValue,
};
