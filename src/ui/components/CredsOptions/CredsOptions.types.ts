interface CredsOptionsProps {
  id: string;
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  credsOptionAction: () => void;
}

export type { CredsOptionsProps };
