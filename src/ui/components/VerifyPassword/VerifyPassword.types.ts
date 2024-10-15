interface VerifyPasswordProps {
  isOpen: boolean;
  setIsOpen: (value: boolean, isCancel?: boolean) => void;
  onVerify: () => void;
}

export type { VerifyPasswordProps };
