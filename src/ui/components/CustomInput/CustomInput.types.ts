import {
  Dispatch,
  SetStateAction,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";

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
  className?: string;
  labelAction?: ReactNode;
}

export type { CustomInputProps };
