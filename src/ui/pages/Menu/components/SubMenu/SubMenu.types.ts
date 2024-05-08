import { ReactNode } from "react";

interface SubMenuProps {
  showSubMenu: boolean;
  setShowSubMenu: (value: boolean) => void;
  title: string;
  additionalButtons?: ReactNode;
  children: ReactNode;
  pageId: string;
}

export type { SubMenuProps };
