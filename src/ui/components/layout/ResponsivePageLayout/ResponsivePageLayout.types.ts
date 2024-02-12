import { ReactNode } from "react";

interface ResponsivePageLayoutProps {
  header?: ReactNode;
  pageId?: string;
  activeStatus?: boolean;
  children?: ReactNode;
  additionalClassNames?: string;
}

export type { ResponsivePageLayoutProps };
