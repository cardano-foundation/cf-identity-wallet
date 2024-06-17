import { ReactNode } from "react";

interface ScrollablePageLayoutProps {
  header?: ReactNode;
  pageId?: string;
  activeStatus?: boolean;
  children?: ReactNode;
  customClass?: string;
  footer?: ReactNode;
}

export type { ScrollablePageLayoutProps };
