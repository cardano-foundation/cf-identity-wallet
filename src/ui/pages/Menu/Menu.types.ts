import { ReactElement, ReactNode } from "react";

interface SubMenuData {
  Component: (props?: {
    switchView: (key: SubMenuKey) => void;
  }) => ReactElement;
  title: string;
  additionalButtons: ReactNode;
  pageId: string;
  nestedMenu: boolean;
  renderAsModal?: boolean;
}

interface SubMenuProps {
  showSubMenu: boolean;
  setShowSubMenu: (value: boolean) => void;
  title: string;
  additionalButtons?: ReactNode;
  children: ReactNode;
}

interface MenuItemProps {
  itemKey: SubMenuKey;
  icon: string;
  label: string;
  subLabel?: string;
  onClick: (key: SubMenuKey) => void;
}

enum SubMenuKey {
  Settings,
  Profile,
  Crypto,
  Connections,
  ConnectWallet,
  ManagePassword,
  TermAndPrivacy,
  RecoverySeedPhrase,
}

export type { SubMenuProps, MenuItemProps, SubMenuData };
export { SubMenuKey };
