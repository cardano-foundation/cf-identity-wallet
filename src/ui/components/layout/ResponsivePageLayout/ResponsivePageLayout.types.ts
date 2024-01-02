import { ReactNode } from "react";

interface ResponsivePageLayoutProps {
  header?: ReactNode;
  pageId?: string;
  children?: ReactNode;
  additionalClassNames?: string;
}

export type { ResponsivePageLayoutProps };
