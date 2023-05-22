import { Dispatch, SetStateAction } from "react";

interface RegexProps {
  password: string;
  setRegexState: Dispatch<SetStateAction<string>>;
}

export type { RegexProps };
