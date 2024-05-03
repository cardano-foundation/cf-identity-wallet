import { ReactElement, ReactNode } from "react";

interface SubMenuData {
  Component: () => ReactElement;
  title: string;
  additionalButtons: ReactNode;
  pageId: string;
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

export enum SubMenuKey {
  Settings,
  Profile,
  Crypto,
  Connections,
  ConnectWallet,
}

export type { SubMenuProps, MenuItemProps, SubMenuData };
