import { ReactNode } from "react";

interface ResponsivePageLayoutProps {
  header?: ReactNode;
  pageId?: string;
  activeStatus?: boolean;
  children?: ReactNode;
  customClass?: string;
}

export type { ResponsivePageLayoutProps };
