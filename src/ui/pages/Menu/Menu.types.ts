import { ReactNode } from "react";

interface SubMenuData {
  Component: () => ReactNode;
  title: string;
  additionalButtons: ReactNode;
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
  onClick: (key: SubMenuKey) => void;
}

export enum SubMenuKey {
  Settings,
  Profile,
  Crypto,
  Connections,
  P2P,
  Identifier,
  Credential,
}

export type { SubMenuProps, MenuItemProps, SubMenuData };
