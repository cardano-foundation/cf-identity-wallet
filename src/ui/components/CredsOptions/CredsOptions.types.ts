import { CredentialDetails } from "../../../core/agent/services/credentialService.types";

interface CredsOptionsProps {
  cardData: CredentialDetails;
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  credsOptionAction: () => void;
}

export type { CredsOptionsProps };
