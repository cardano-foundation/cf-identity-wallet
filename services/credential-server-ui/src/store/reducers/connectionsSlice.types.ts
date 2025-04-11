import { CredentialType } from "../../const";

interface A {
  d: string;
  i: string;
  LEI: string;
  dt: string;
}

interface Sad {
  v: string;
  d: string;
  i: string;
  ri: string;
  s: string;
  a: A;
}

interface Schema {
  $id: string;
  $schema: string;
  title: string;
  description: string;
  type: string;
  credentialType: string;
  version: string;
  properties: Record<string, number | string>;
  additionalProperties: boolean;
  required: string[];
}

interface Status {
  vn: number[];
  i: string;
  s: string;
  d: string;
  ri: string;
  dt: string;
  et: string;
}

interface Credential {
  rev: null;
  revatc: null;
  pre: string;
  contactId: string;
  status: Status;
  schema: Schema;
  sad: Sad;
}

enum PresentationRequestStatus {
  Requested = "requested",
}

interface PresentationRequestData {
  id: string;
  connectionName: string;
  credentialType: CredentialType;
  attribute: string;
  requestDate: number;
  status: PresentationRequestStatus;
}

export type { Credential, PresentationRequestData };
export { PresentationRequestStatus };
