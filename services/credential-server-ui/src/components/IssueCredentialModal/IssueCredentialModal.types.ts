import { CredentialType } from "../../const";
import { Contact } from "../../pages/Connections/components/ConnectionsTable/ConnectionsTable.types";

interface ReviewProps {
  credentialType?: CredentialType;
  connectionId?: string;
  attribute: Record<string, string>;
  connections: Contact[];
}

interface InputAttributeProps {
  credentialType?: CredentialType;
  value: Record<string, string>;
  setValue: (key: string, value: string) => void;
}

interface SelectConnectionStageProps {
  value?: string;
  onChange: (value: string) => void;
  connections: Contact[];
}

interface IssueCredentialModalProps {
  open: boolean;
  onClose: () => void;
  credentialType?: CredentialType;
  connectionId?: string;
}

enum IssueCredentialStage {
  SelectConnection,
  SelectCredentialType,
  InputAttribute,
  Review,
}

export type {
  IssueCredentialModalProps,
  SelectConnectionStageProps,
  InputAttributeProps,
  ReviewProps,
};
export { IssueCredentialStage };
