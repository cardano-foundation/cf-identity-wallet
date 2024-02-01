import { ReactNode } from "react";

interface ScrollablePageLayoutProps {
  header?: ReactNode;
  pageId?: string;
  children?: ReactNode;
  additionalClassNames?: string;
}

export type { ScrollablePageLayoutProps };
