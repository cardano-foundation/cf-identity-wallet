import { W3CCredentialDetails } from "../../../core/agent/services/credentialService.types";

interface CredsOptionsProps {
  cardData: W3CCredentialDetails;
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  credsOptionAction: () => void;
}

export type { CredsOptionsProps };
