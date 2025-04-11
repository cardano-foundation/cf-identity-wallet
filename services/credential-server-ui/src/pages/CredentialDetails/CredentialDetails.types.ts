import { Credential } from "../../store/reducers/connectionsSlice.types";

interface CredentialInfoCardProps {
  schemaName: string;
  creationDate: Date;
}

interface CredentialTableProps {
  credentials: Credential[];
}

interface CredentialTableRow {
  id: string;
  name: string;
  attribute: string;
  identifier: string;
  credentialId: string;
  date: number;
  status: number;
  data: Credential;
}

export type {
  CredentialInfoCardProps,
  CredentialTableProps,
  CredentialTableRow,
};
