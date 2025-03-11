import { ReactNode } from "react";

interface PopupModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  body?: ReactNode;
  footer?: ReactNode;
  customClass?: string;
}

export type { PopupModalProps };
