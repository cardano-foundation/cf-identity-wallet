interface AlertProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  headerText: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  actionConfirm?: () => void;
}

export type { AlertProps };
