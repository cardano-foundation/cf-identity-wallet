import { ReactNode } from "react";

interface MenuItemProps {
  label: string;
  icon?: ReactNode;
  iconLocation: "left" | "right";
  action: () => void;
  disabled?: boolean;
  className?: string;
}

interface DividerProps {
  className?: string;
}

interface DropdownMenuProps {
  button: ReactNode;
  menuItems: (MenuItemProps | DividerProps)[];
  menuTitle?: string;
}

export type { MenuItemProps, DividerProps, DropdownMenuProps };
