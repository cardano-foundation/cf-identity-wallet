import {
  ACDCDetails,
  W3CCredentialDetails,
} from "../../../core/agent/services/credentialService.types";

interface CredsOptionsProps {
  cardData: W3CCredentialDetails | ACDCDetails;
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  credsOptionAction: () => void;
}

export type { CredsOptionsProps };
