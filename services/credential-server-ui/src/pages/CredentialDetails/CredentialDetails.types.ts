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
  identifier: string;
  date: number;
  status: number;
  data: Credential;
}

export type {
  CredentialInfoCardProps,
  CredentialTableProps,
  CredentialTableRow,
};
