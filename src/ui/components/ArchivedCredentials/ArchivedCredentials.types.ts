import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";

interface ArchivedCredentialsProps {
  archivedCreds: CredentialShortDetails[];
  revokedCreds: CredentialShortDetails[];
  archivedCredentialsIsOpen: boolean;
  setArchivedCredentialsIsOpen: (value: boolean) => void;
}

interface ArchivedCredentialsContainerRef {
  clearAchirvedState: () => void;
}

interface CredentialItemProps {
  credential: CredentialShortDetails;
  activeList: boolean;
  onClick: (credentialId: string) => void;
  isSelected: boolean;
  onCheckboxChange: (credentialId: string) => void;
  onRestore?: (credentialId: string) => void;
  onDelete: (credentialId: string) => void;
}

export type {
  ArchivedCredentialsProps,
  ArchivedCredentialsContainerRef,
  CredentialItemProps,
};
