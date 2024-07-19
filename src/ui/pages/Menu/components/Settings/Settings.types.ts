import { ReactNode } from "react";
import { SubMenuKey } from "../../Menu.types";

interface SettingsProps {
  switchView?: (key: SubMenuKey) => void;
}

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

export type { SettingsProps, OptionProps, SettingsItemProps };
