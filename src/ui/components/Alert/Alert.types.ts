interface AlertProps {
  isOpen: boolean;
  backdropDismiss?: boolean;
  setIsOpen: (value: boolean) => void;
  dataTestId: string;
  headerText: string;
  subheaderText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  className?: string;
  actionConfirm?: () => void;
  actionCancel?: () => void;
  actionDismiss?: () => void;
}

export type { AlertProps };
