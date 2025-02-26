import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { i18n } from "../../../../i18n";
import { DrawerContentProps } from "./DrawerContent.types";

const DrawerContent = ({
  handleDrawerToggle,
  menuItems,
}: DrawerContentProps) => {
  const location = useLocation();
  const getIcon = (icons: JSX.Element[], isActive: boolean) =>
    isActive ? icons[0] : icons[1];

  return (
    <Box
      id="drawer"
      onClick={handleDrawerToggle}
      color="text.primary"
      bgcolor="background.default"
    >
      <Typography
        variant="h6"
        sx={{ my: 2 }}
      >
        {i18n.t("navbar.menu")}
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.key}
            component={Link}
            to={item.path}
            disablePadding
          >
            <ListItemButton
              className={location.pathname === item.path ? "active" : ""}
            >
              <ListItemIcon>
                {getIcon(item.icons, location.pathname === item.path)}
              </ListItemIcon>
              <ListItemText primary={item.label} />
              {location.pathname === item.path && (
                <div className="active-bar" />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export { DrawerContent };
