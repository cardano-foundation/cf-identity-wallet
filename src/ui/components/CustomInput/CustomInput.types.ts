import { Dispatch, SetStateAction } from "react";

interface CustomInputProps {
  dataTestId: string;
  title?: string;
  autofocus?: boolean;
  placeholder?: string;
  hiddenInput: boolean;
  value: string;
  onChangeInput: Dispatch<SetStateAction<string>>;
  onChangeFocus?: Dispatch<SetStateAction<boolean>>;
  optional?: boolean;
}

export type { CustomInputProps };
