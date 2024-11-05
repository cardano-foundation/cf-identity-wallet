import { ReactNode } from "react";

export interface CardDetailsItemProps {
  info: string;
  copyButton?: boolean;
  icon?: string;
  customIcon?: string;
  keyValue?: string;
  testId?: string;
  infoTestId?: string;
  className?: string;
  mask?: boolean;
  fullText?: boolean;
  endSlot?: ReactNode;
  copyContent?: string;
}
