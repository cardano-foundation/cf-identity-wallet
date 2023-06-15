interface VerifyPasswordProps {
  modalIsOpen: boolean;
  setModalIsOpen: (value: boolean) => void;
  onVerify: (isVerified: boolean) => void;
}

export type { VerifyPasswordProps };
