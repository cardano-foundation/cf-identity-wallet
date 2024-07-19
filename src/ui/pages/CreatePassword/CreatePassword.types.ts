interface RegexItemProps {
  condition: boolean;
  label: string;
}
interface PasswordRegexProps {
  password: string;
}

interface CreatePasswordProps {
  isModal: boolean;
  setCreatePasswordModalIsOpen: (value: boolean) => void;
  setPasswordIsSet: (value: boolean) => void;
}

export type { PasswordRegexProps, RegexItemProps, CreatePasswordProps };
