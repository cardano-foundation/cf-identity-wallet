interface CreatePasscodeModuleProps {
  title?: string;
  description?: string;
  testId: string;
  overrideAlertZIndex?: boolean;
  onCreateSuccess: () => void;
  onPasscodeChange?: (passcode: string, originalPassCode: string) => void;
}

interface CreatePasscodeModuleRef {
  clearState: () => void;
}

export type { CreatePasscodeModuleProps, CreatePasscodeModuleRef };
