import { ReactNode } from "react";

interface TabLayoutProps {
  pageId?: string;
  customClass?: string;
  header?: boolean;
  avatar?: ReactNode;
  backButton?: boolean;
  backButtonAction?: () => void;
  title?: string;
  titleSize?: string;
  titleAction?: () => void;
  menuButton?: boolean;
  additionalButtons?: ReactNode;
  actionButton?: boolean;
  actionButtonAction?: () => void;
  actionButtonLabel?: string;
  children?: ReactNode;
  placeholder?: ReactNode;
}

export type { TabLayoutProps };
