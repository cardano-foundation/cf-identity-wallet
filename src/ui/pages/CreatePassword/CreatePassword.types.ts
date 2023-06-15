import { Dispatch, SetStateAction } from "react";

interface RegexItemProps {
  condition: RegExpMatchArray | boolean | null;
  label: string;
}
interface PasswordRegexProps {
  password: string;
  setRegexState: Dispatch<SetStateAction<boolean>>;
}

export type { PasswordRegexProps, RegexItemProps };
