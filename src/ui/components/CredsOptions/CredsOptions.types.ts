import { ACDCDetails } from "../../../core/agent/services/credentialService.types";

interface CredsOptionsProps {
  cardData: ACDCDetails;
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  credsOptionAction: () => void;
}

export type { CredsOptionsProps };
