import { ReactNode } from "react";

interface PageHeaderProps {
  backButton?: boolean;
  beforeBack?: () => void;
  onBack?: () => void;
  currentPath?: string;
  children?: ReactNode;
  closeButton?: boolean;
  closeButtonAction?: () => void;
  closeButtonLabel?: string;
  closeButtonIcon?: string;
  actionButton?: boolean;
  actionButtonDisabled?: boolean;
  actionButtonAction?: () => void;
  actionButtonLabel?: string;
  actionButtonIcon?: string;
  progressBar?: boolean;
  progressBarValue?: number;
  progressBarBuffer?: number;
  title?: string;
  additionalButtons?: ReactNode;
}

export type { PageHeaderProps };
