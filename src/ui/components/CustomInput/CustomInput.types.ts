import { Dispatch, SetStateAction } from "react";

interface CustomInputProps {
  dataTestId: string;
  title: string;
  placeholder: string;
  hiddenInput: boolean;
  onChangeInput: Dispatch<SetStateAction<string>>;
  setFocus?: Dispatch<SetStateAction<boolean>>;
  optional?: boolean;
}

export type { CustomInputProps };
