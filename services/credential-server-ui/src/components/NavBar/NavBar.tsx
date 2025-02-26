import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Container,
  Button,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Dashboard as DashboardFull,
  DashboardOutlined,
  Group as GroupFull,
  GroupOutlined,
  Badge as BadgeFull,
  BadgeOutlined,
  Notifications as NotificationsFull,
  NotificationsOutlined,
  Settings as SettingsFull,
  SettingsOutlined,
} from "@mui/icons-material";
import Logo from "../../assets/Logo.svg";
import "./NavBar.scss";
import { SwitchAccount } from "../SwitchAccount";
import { i18n } from "../../i18n";

interface Props {
  window?: () => Window;
}

const drawerWidth = 240;
const menuItems = [
  {
    key: "overview",
    label: i18n.t("navbar.overview"),
    path: "/",
    icon: [<DashboardFull />, <DashboardOutlined />],
  },
  {
    key: "connections",
    label: i18n.t("navbar.connections"),
    path: "/connections",
    icon: [<GroupFull />, <GroupOutlined />],
  },
  {
    key: "credentials",
    label: i18n.t("navbar.credentials"),
    path: "/credentials",
    icon: [<BadgeFull />, <BadgeOutlined />],
  },
];

const NavBar = (props: Props) => {
  const { window } = props;
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box
      id="drawer"
      onClick={handleDrawerToggle}
      sx={{
        textAlign: "left",
        backgroundColor: "background.default",
        height: "100%",
      }}
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
                {item.icon[location.pathname === item.path ? 0 : 1]}
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

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <AppBar
      id="navBar"
      position="static"
      sx={{ boxShadow: 0, backgroundColor: "background.default" }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            className="nav-tablet"
            sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer menu"
              edge="start"
              className="menu-button"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon className="menu-icon" />
              <Typography>{i18n.t("navbar.menu")}</Typography>
            </IconButton>
            <Button
              component={Link}
              to={"/"}
              className="header-logo"
            >
              <img
                alt="veridian-logo"
                src={Logo}
              />
            </Button>
          </Box>
          <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, display: { md: "none" } }}
            aria-label="mobile menu"
          >
            <Drawer
              container={container}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: "block", sm: "block", md: "none" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                },
              }}
            >
              {drawer}
            </Drawer>
          </Box>
          <Box
            className="nav-left"
            sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}
          >
            <Button
              component={Link}
              to={"/"}
            >
              <img
                className="header-logo"
                alt="veridian-logo"
                src={Logo}
              />
            </Button>
            {menuItems.map((item) => (
              <MenuItem
                key={item.key}
                component={Link}
                to={item.path}
                className={location.pathname === item.path ? "active" : ""}
              >
                <Typography textAlign="center">
                  {item.icon[location.pathname === item.path ? 0 : 1]}
                  {item.label}
                </Typography>
                {location.pathname === item.path && (
                  <div className="active-bar" />
                )}
              </MenuItem>
            ))}
          </Box>
          <Box
            className="nav-right"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            <IconButton
              size="large"
              aria-label="show new notifications"
              color="inherit"
              component={Link}
              to={"/notifications"}
              className={location.pathname === "/notifications" ? "active" : ""}
            >
              <Badge
                badgeContent={0}
                color="error"
              >
                {location.pathname === "/notifications" ? (
                  <NotificationsFull />
                ) : (
                  <NotificationsOutlined />
                )}
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              aria-label="show settings"
              color="inherit"
              component={Link}
              to={"/settings"}
              className={location.pathname === "/settings" ? "active" : ""}
            >
              <Badge>
                {location.pathname === "/settings" ? (
                  <SettingsFull />
                ) : (
                  <SettingsOutlined />
                )}
              </Badge>
            </IconButton>
          </Box>
          <SwitchAccount />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export { NavBar };
