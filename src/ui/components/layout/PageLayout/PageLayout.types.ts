import { ReactNode } from "react";

interface PageLayoutProps {
  id?: string;
  header?: boolean;
  backButton?: boolean;
  onBack?: () => void;
  currentPath?: string;
  children?: ReactNode;
  closeButton?: boolean;
  closeButtonAction?: () => void;
  closeButtonLabel?: string;
  actionButton?: boolean;
  actionButtonDisabled?: boolean;
  actionButtonAction?: () => void;
  actionButtonLabel?: string;
  actionButtonIcon?: string;
  progressBar?: boolean;
  progressBarValue?: number;
  progressBarBuffer?: number;
  title?: string | boolean;
  menuButton?: boolean;
  footer?: boolean;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  primaryButtonDisabled?: boolean;
}

export type { PageLayoutProps };
