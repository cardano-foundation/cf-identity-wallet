import { ReactNode } from "react";

interface PasscodeModuleProps {
  title: string;
  description: string;
  error: ReactNode;
  passcode: string;
  handlePinChange: (digit: number) => void;
  handleRemove: () => void;
}

export type { PasscodeModuleProps };
