import { ReactNode } from "react";

interface SubMenuProps {
  showSubMenu: boolean;
  setShowSubMenu: (value: boolean) => void;
  title: string;
  additionalButtons?: ReactNode;
  children: ReactNode;
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

export type { SubMenuProps };
