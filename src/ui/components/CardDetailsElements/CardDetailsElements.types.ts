import { ReactNode } from "react";

interface CardDetailsItemProps {
  info: string;
  copyButton?: boolean;
  icon?: string;
  keyValue?: string;
  textIcon?: string;
  testId?: string;
}

interface CardDetailsBlockProps {
  title: string;
  children?: ReactNode;
}

interface CardDetailsAttributesProps {
  data: any;
  customType?: string;
}

export type {
  CardDetailsItemProps,
  CardDetailsBlockProps,
  CardDetailsAttributesProps,
};
