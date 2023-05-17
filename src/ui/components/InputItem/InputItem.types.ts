import { Dispatch, SetStateAction } from "react";

interface InputItemProps {
  title: string;
  placeholder: string;
  hiddenInput: boolean;
  setValue: Dispatch<SetStateAction<string>>;
  optional?: boolean;
}

export type { InputItemProps };
