import { ReactNode } from "react";

interface PageFooterProps {
  pageId?: string;
  customClass?: string;
  primaryButtonIcon?: string;
  primaryButtonText?: string;
  primaryButtonAction?: (() => void) | string;
  primaryButtonDisabled?: boolean;
  secondaryButtonIcon?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: (() => void) | string;
  secondaryButtonDisabled?: boolean;
  tertiaryButtonIcon?: string;
  tertiaryButtonText?: string;
  tertiaryButtonAction?: (() => void) | string;
  tertiaryButtonDisabled?: boolean;
  archiveButtonText?: string;
  archiveButtonAction?: (() => void) | string;
  archiveButtonDisabled?: boolean;
  deleteButtonText?: string;
  deleteButtonAction?: (() => void) | string;
  deleteButtonDisabled?: boolean;
  declineButtonIcon?: string;
  declineButtonText?: string;
  declineButtonAction?: (() => void) | string;
  declineButtonDisabled?: boolean;
  children?: ReactNode;
}

export type { PageFooterProps };
