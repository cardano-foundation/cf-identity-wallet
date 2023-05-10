import { ReactNode } from "react";

interface PageLayoutProps {
  backButton?: boolean;
  backButtonPath?: string;
  children?: ReactNode;
  closeButton?: boolean;
  closeButtonAction?: () => void;
  progressBar?: boolean;
  progressBarValue?: number;
  progressBarBuffer?: number;
  title?: string;
}

export type { PageLayoutProps };
