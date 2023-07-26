interface ChooseAccountNameProps {
  chooseAccountNameIsOpen: boolean;
  setChooseAccountNameIsOpen: (value: boolean) => void;
  seedPhrase?: string;
  usesIdentitySeedPhrase: boolean;
  onDone?: () => void;
}

export type { ChooseAccountNameProps };
