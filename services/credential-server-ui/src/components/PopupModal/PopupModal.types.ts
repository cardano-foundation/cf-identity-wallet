import { ReactNode } from "react";

interface PopupModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string | ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  customClass?: string;
}

export type { PopupModalProps };
