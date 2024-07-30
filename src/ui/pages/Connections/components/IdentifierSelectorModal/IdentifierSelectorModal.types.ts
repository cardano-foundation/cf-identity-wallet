import { IdentifierShortDetails } from "../../../../../core/agent/services/identifier.types";

interface IdentifierSelectorProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onSubmit: (indentifier: IdentifierShortDetails) => void;
}

export type { IdentifierSelectorProps };
