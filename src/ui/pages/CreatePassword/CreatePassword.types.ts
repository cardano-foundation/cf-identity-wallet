import { MutableRefObject } from "react";

interface RegexItemProps {
  condition: boolean;
  label: string;
}
interface PasswordRegexProps {
  password: string;
}

interface CreatePasswordProps {
  handleClear: () => void;
  setPasswordIsSet: (value: boolean) => void;
  userAction?: MutableRefObject<string>;
}

export type { PasswordRegexProps, RegexItemProps, CreatePasswordProps };
