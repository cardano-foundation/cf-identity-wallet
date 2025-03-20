import { ReactNode } from "react";
import { SubMenuKey } from "../../Menu.types";

interface SettingsProps {
  switchView?: (key: SubMenuKey) => void;
  handleClose?: () => void;
}

interface OptionProps {
  index: number;
  icon: string;
  label: string;
  actionIcon?: ReactNode;
  note?: string;
  href?: string;
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
  DeleteAccount,
}

interface SettingsItemProps {
  item: OptionProps;
  handleOptionClick: (item: OptionProps) => void;
}

export type { SettingsProps, OptionProps, SettingsItemProps };
export { OptionIndex };
