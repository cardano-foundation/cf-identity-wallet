import { ReactNode } from "react";
import { SubMenuKey } from "../../Menu.types";

interface SubMenuProps {
  showSubMenu: boolean;
  setShowSubMenu: (value: boolean) => void;
  switchView: (key: SubMenuKey) => void;
  nestedMenu: boolean;
  closeButtonLabel?: string;
  closeButtonAction?: () => void;
  title: string;
  additionalButtons?: ReactNode;
  actionButton?: boolean;
  actionButtonAction?: () => void;
  actionButtonLabel?: string;
  children: ReactNode;
  pageId: string;
  renderAsModal?: boolean;
}

export type { SubMenuProps };
