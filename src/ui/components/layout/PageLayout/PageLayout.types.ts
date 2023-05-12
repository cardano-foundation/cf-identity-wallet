import { ReactNode } from "react";

interface PageLayoutProps {
  header?: boolean;
  backButton?: boolean;
  backButtonPath?: string;
  currentPath?: string;
  onBack?: () => void;
  children?: ReactNode;
  closeButton?: boolean;
  closeButtonAction?: () => void;
  progressBar?: boolean;
  progressBarValue?: number;
  progressBarBuffer?: number;
  title?: string;
  footer?: boolean;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  primaryButtonDisabled?: boolean;
}

export type { PageLayoutProps };
