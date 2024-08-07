import { ReactNode } from "react";
import { SubMenuKey } from "../../Menu.types";

interface SubMenuProps {
  showSubMenu: boolean;
  setShowSubMenu: (value: boolean) => void;
  switchView: (key: SubMenuKey) => void;
  nestedMenu: boolean;
  title: string;
  additionalButtons?: ReactNode;
  children: ReactNode;
  pageId: string;
  renderAsModal?: boolean;
}

export type { SubMenuProps };
