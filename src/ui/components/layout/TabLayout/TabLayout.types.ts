import { ReactNode } from "react";

interface TabLayoutProps {
  currentPath: string;
  header?: boolean;
  title?: string;
  menuButton?: boolean;
  otherButtons?: ReactNode;
  children?: ReactNode;
}

export type { TabLayoutProps };
