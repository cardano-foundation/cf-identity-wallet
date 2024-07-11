import { ReactNode } from "react";

interface TabLayoutProps {
  pageId?: string;
  customClass?: string;
  header?: boolean;
  avatar?: ReactNode;
  backButton?: boolean;
  backButtonAction?: () => void;
  title?: string;
  doneLabel?: string;
  doneAction?: () => void;
  additionalButtons?: ReactNode;
  actionButton?: boolean;
  actionButtonAction?: () => void;
  actionButtonLabel?: string;
  children?: ReactNode;
  placeholder?: ReactNode;
  preventBackButtonEvent?: boolean;
}

export type { TabLayoutProps };
