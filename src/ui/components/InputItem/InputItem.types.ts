import { Dispatch, SetStateAction } from "react";

interface InputItemProps {
  title: string;
  placeholder: string;
  hiddenInput: boolean;
  setValue: Dispatch<SetStateAction<string>>;
  setFocus?: Dispatch<SetStateAction<boolean>>;
  optional?: boolean;
}

export type { InputItemProps };
