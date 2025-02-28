interface MenuItem {
  key: string;
  path: string;
  label: string;
  icons: JSX.Element[];
}

interface DrawerContentProps {
  handleDrawerToggle: () => void;
  menuItems: MenuItem[];
}

export type { DrawerContentProps };
