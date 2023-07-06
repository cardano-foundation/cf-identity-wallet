import { ReactNode } from "react";

interface TabLayoutProps {
  header?: boolean;
  avatar?: ReactNode;
  title?: string;
  titleSize?: string;
  titleAction?: () => void;
  menuButton?: boolean;
  additionalButtons?: ReactNode;
  children?: ReactNode;
}

export type { TabLayoutProps };
