import { ReactNode } from "react";

interface PageFooterProps {
  pageId?: string;
  customClass?: string;
  primaryButtonIcon?: string;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  primaryButtonDisabled?: boolean;
  secondaryButtonIcon?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
  secondaryButtonDisabled?: boolean;
  tertiaryButtonIcon?: string;
  tertiaryButtonText?: string;
  tertiaryButtonAction?: () => void;
  tertiaryButtonDisabled?: boolean;
  archiveButtonText?: string;
  archiveButtonAction?: () => void;
  archiveButtonDisabled?: boolean;
  deleteButtonText?: string;
  deleteButtonAction?: () => void;
  deleteButtonDisabled?: boolean;
  declineButtonIcon?: string;
  declineButtonText?: string;
  declineButtonAction?: () => void;
  declineButtonDisabled?: boolean;
  children?: ReactNode;
}

export type { PageFooterProps };
