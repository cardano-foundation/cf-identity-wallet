import { ConnectionType } from "../agent.types";
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

interface W3CCredentialDetails extends CredentialShortDetails {
  connectionType: ConnectionType.DIDCOMM;
  type: string[];
  connectionId?: string;
  expirationDate?: string;
  credentialSubject: JSONObject;
  proofType: string;
  proofValue?: string;
}

interface ACDCDetails extends CredentialShortDetails {
  connectionType: ConnectionType.KERI;
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
  W3CCredentialDetails,
  JSONObject,
};
