interface PageFooterProps {
  pageId?: string;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  primaryButtonDisabled?: boolean;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
  secondaryButtonDisabled?: boolean;
  tertiaryButtonText?: string;
  tertiaryButtonAction?: () => void;
  tertiaryButtonDisabled?: boolean;
  deleteButtonText?: string;
  deleteButtonAction?: () => void;
  deleteButtonDisabled?: boolean;
}

export type { PageFooterProps };
