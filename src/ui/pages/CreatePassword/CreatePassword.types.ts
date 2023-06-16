import { Dispatch, SetStateAction } from "react";

interface RegexItemProps {
  condition: RegExpMatchArray | null;
  label: string;
}
interface PasswordRegexProps {
  password: string;
  setRegexState: Dispatch<SetStateAction<string>>;
}

export type { PasswordRegexProps, RegexItemProps };
