import { ReactNode } from "react";

interface CardDetailsItemProps {
  info: string;
  copyButton: boolean;
  icon?: string;
  textIcon?: string;
  testId?: string;
}

interface CardDetailsBlockProps {
  title: string;
  children?: ReactNode;
}

export type { CardDetailsItemProps, CardDetailsBlockProps };
