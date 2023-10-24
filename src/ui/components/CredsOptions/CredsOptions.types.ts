import { CredentialDetails } from "../../../core/agent/agent.types";

interface CredsOptionsProps {
  cardData: CredentialDetails;
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  credsOptionAction: () => void;
}

export type { CredsOptionsProps };
