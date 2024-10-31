import { ReactNode } from "react";

export interface CardDetailsBlockProps {
  title?: string | null;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}
