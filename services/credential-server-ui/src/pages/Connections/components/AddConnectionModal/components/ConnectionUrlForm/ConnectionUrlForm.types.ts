import { ChangeEvent } from "react";

interface ConnectionUrlFormProps {
  inputValue: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export type { ConnectionUrlFormProps };
