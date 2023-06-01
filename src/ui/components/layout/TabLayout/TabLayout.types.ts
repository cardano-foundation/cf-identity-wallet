import { ReactNode } from "react";

interface TabLayoutProps {
  header?: boolean;
  title?: string;
  titleSize?: string;
  titleAction?: () => void;
  menuButton?: boolean;
  otherButtons?: ReactNode;
  children?: ReactNode;
}

export type { TabLayoutProps };
