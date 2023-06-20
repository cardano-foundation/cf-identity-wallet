import { Dispatch, SetStateAction } from "react";

interface CustomInputProps {
  dataTestId: string;
  title?: string;
  autofocus?: boolean;
  placeholder?: string;
  hiddenInput: boolean;
  value: string;
  onChangeInput: (text:string) => void;
  onChangeFocus?: Dispatch<SetStateAction<boolean>>;
  optional?: boolean;
}

export type { CustomInputProps };
