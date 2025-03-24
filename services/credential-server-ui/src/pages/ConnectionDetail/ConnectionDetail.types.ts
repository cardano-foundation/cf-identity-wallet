import { Contact } from "../Connections/components/ConnectionsTable/ConnectionsTable.types";
import { Credential } from "../../store/reducers/connectionsSlice.types";

interface ConnectionContactCardProps {
  contact?: Contact;
  credentials: Credential[];
}

interface CredentialTableProps {
  credentials: Credential[];
  contactId?: string;
}

interface CredentialTableRow {
  id: string;
  name: string;
  date: number;
  status: number;
  data: Credential;
}

export type {
  ConnectionContactCardProps,
  CredentialTableProps,
  CredentialTableRow,
};
