interface ConnectionOptionsProps {
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  handleEdit: (value: boolean) => void;
  handleDelete: () => void;
  restrictedOptions?: boolean;
}

export type { ConnectionOptionsProps };
