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

enum OptionIndex {
  BiometricUpdate,
  ChangePin,
  ManagePassword,
  RecoverySeedPhrase,
  Documentation,
  Term,
  Contact,
  Version,
}

interface SettingsItemProps {
  item: OptionProps;
  handleOptionClick: (item: OptionProps) => void;
}

export type { SettingsProps, OptionProps, SettingsItemProps };
export { OptionIndex };
