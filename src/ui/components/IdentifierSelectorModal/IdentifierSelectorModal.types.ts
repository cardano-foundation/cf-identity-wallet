import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";

interface IdentifierSelectorProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onSubmit: (indentifier: IdentifierShortDetails) => void;
  identifiers?: IdentifierShortDetails[];
}

export type { IdentifierSelectorProps };
