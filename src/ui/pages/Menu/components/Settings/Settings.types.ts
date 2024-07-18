import { ReactNode } from "react";

interface OptionProps {
  index: number;
  icon: string;
  label: string;
  actionIcon?: ReactNode;
  note?: string;
}

interface SettingsItemProps {
  item: OptionProps;
  handleOptionClick: (item: OptionProps) => void;
}

export type { OptionProps, SettingsItemProps };
