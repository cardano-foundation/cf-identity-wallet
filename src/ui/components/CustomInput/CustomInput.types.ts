import { Dispatch, SetStateAction } from "react";

interface CustomInputProps {
  dataTestId: string;
  title?: string;
  placeholder?: string;
  hiddenInput: boolean;
  value: string;
  onChangeInput: Dispatch<SetStateAction<string>>;
  onChangeFocus?: Dispatch<SetStateAction<boolean>>;
  optional?: boolean;
}

export type { CustomInputProps };
