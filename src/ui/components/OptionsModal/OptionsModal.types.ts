import { ReactNode } from "react";
import { PageHeaderProps } from "../PageHeader/PageHeader.types";
import { ResponsiveModalProps } from "../layout/ResponsiveModal/ResponsiveModal.types";

export interface OptionItem {
  className?: string;
  icon?: string;
  label: string;
  onClick?: () => void;
  testId?: string;
}

export interface OptionListProps {
  data: OptionItem[];
  className?: string;
}

export interface OptionModalProps extends ResponsiveModalProps {
  header: PageHeaderProps;
  items?: OptionItem[];
  children?: ReactNode;
}
