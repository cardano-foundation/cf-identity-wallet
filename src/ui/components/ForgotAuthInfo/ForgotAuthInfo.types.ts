enum ForgotType {
  Passcode = "passcode",
  Password = "password",
}

interface ForgotAuthInfoProps {
  isOpen: boolean;
  onClose: (shouldCloseParent?: boolean) => void;
  type: ForgotType;
}

export type { ForgotAuthInfoProps };
export { ForgotType };
