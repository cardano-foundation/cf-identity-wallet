import { ReactNode } from "react";

interface PageLayoutProps {
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
}

export type { PageLayoutProps };
