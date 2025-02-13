import { ReactNode } from "react";

interface CardDetailsBlockProps {
  title?: string | null;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

enum FlatBorderType {
  TOP,
  BOT,
}

interface CardBlockProps {
  title?: string | null;
  onClick?: () => void;
  children?: ReactNode;
  testId?: string;
  flatBorder?: FlatBorderType;
  className?: string;
  copyContent?: string;
}

export type { CardDetailsBlockProps, CardBlockProps };
export { FlatBorderType };
