import { ReactNode } from "react";

interface PasscodeModuleProps {
  error: ReactNode;
  passcode: string;
  handlePinChange: (digit: number) => void;
  handleRemove: () => void;
}

export type { PasscodeModuleProps };
