interface MenuItem {
  key: string;
  path: string;
  label: string;
  icons: React.ReactElement[];
}

interface DrawerContentProps {
  handleDrawerToggle: () => void;
  menuItems: MenuItem[];
}

export type { DrawerContentProps };
