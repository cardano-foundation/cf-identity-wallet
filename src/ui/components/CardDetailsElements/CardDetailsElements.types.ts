import { JsonObject } from "@aries-framework/core";
import { ReactNode } from "react";

interface CardDetailsItemProps {
  info: string;
  copyButton?: boolean;
  icon?: string;
  keyValue?: string;
  textIcon?: string;
  testId?: string;
}

interface CardDetailsInfoBlockProps {
  title: string;
  children?: ReactNode;
}

interface CardDetailsAttributesProps {
  data: JsonObject;
  customType?: string;
}

export type {
  CardDetailsItemProps,
  CardDetailsInfoBlockProps,
  CardDetailsAttributesProps,
};
