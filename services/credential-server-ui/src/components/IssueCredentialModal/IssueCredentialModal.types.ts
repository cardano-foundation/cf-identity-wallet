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

interface IssueCredListData {
  id: string;
  text: string;
  subText?: string;
}

interface IssueCredListTemplateProps {
  value?: string;
  onChange: (value: string) => void;
  data: IssueCredListData[];
}

interface IssueCredentialModalProps {
  open: boolean;
  onClose: () => void;
  credentialTypeId?: string;
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
  IssueCredListTemplateProps,
  InputAttributeProps,
  ReviewProps,
  IssueCredListData,
};
export { IssueCredentialStage };
