interface AlertProps {
  isOpen: boolean;
  backdropDismiss?: boolean;
  setIsOpen: (value: boolean) => void;
  dataTestId: string;
  headerText: string;
  subheaderText?: string;
  confirmButtonText?: string;
  secondaryConfirmButtonText?: string;
  cancelButtonText?: string;
  className?: string;
  actionConfirm?: () => void;
  actionSecondaryConfirm?: () => void;
  actionCancel?: () => void;
  actionDismiss?: () => void;
}

export type { AlertProps };
