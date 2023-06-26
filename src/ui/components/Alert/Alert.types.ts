interface AlertProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  headerText: string;
  subheaderText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  actionConfirm?: () => void;
  actionDismiss?: () => void;
}

export type { AlertProps };
