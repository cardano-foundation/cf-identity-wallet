import { CredentialShortDetails } from "../../../core/agent/services/credentialService.types";

interface ArchivedCredentialsProps {
  archivedCreds: CredentialShortDetails[];
  archivedCredentialsIsOpen: boolean;
  setArchivedCredentialsIsOpen: (value: boolean) => void;
}

export type { ArchivedCredentialsProps };
