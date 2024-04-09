import { ACDCDetails } from "../../../core/agent/services/credentialService.types";

interface CredentialOptionsProps {
  cardData: ACDCDetails;
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  credsOptionAction: () => void;
}

export type { CredentialOptionsProps };
