interface SetConnectionAliasProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  onConfirm: (name: string) => void;
}

export type { SetConnectionAliasProps };
