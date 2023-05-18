import { Dispatch, SetStateAction } from "react";

interface OperationsPasswordRegexProps {
  password: string;
  setRegexState: Dispatch<SetStateAction<string>>;
}

export type { OperationsPasswordRegexProps };
