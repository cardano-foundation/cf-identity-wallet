import { ReactNode } from "react";

interface PasscodeModuleProps {
  error: ReactNode;
  passcode: string;
  hasError?: boolean;
  handlePinChange: (digit: number) => void;
  handleRemove: () => void;
  handleBiometricButtonClick?: () => void;
}

export type { PasscodeModuleProps };
