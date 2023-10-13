interface ConnectionOptionsProps {
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  handleEdit: (value: boolean) => void;
  handleDelete: () => void;
}

export type { ConnectionOptionsProps };
