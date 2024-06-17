import { Dispatch, SetStateAction, MouseEvent as ReactMouseEvent } from "react";

interface CustomInputProps {
  dataTestId: string;
  title?: string;
  autofocus?: boolean;
  placeholder?: string;
  hiddenInput?: boolean;
  value: string;
  onChangeInput: (text: string) => void;
  onChangeFocus?: Dispatch<SetStateAction<boolean>>;
  optional?: boolean;
  error?: boolean;
  actionIcon?: string;
  action?: (e: ReactMouseEvent<HTMLElement, MouseEvent>) => void;
}

export type { CustomInputProps };
