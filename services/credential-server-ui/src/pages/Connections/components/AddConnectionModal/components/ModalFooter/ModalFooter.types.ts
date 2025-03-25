interface ModalFooterProps {
  currentStage: number;
  errorOnRequest: boolean;
  oobi: string;
  copied: boolean;
  isInputValid: boolean;
  handleShowQr: () => void;
  handleCopyLink: () => void;
  handleNext: () => void;
  handleBack: () => void;
  handleComplete: () => void;
}

export type { ModalFooterProps };
