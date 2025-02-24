import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import {
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import DashboardFilled from "@mui/icons-material/Dashboard";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import Logo from "../../assets/Logo.svg";
import "./NavBar.scss";
import { SwitchAccount } from "../SwitchAccount";
import { i18n } from "../../i18n";

interface Props {
  window?: () => Window;
}

const drawerWidth = 240;
const drawerItems = [
  i18n.t("navbar.overview"),
  i18n.t("navbar.connections"),
  i18n.t("navbar.credentials"),
];
const drawerIcons = [<DashboardFilled />, <GroupOutlined />, <BadgeOutlined />];

const NavBar = (props: Props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box
      id="drawer"
      onClick={handleDrawerToggle}
      sx={{ textAlign: "left" }}
    >
      <Typography
        variant="h6"
        sx={{ my: 2 }}
      >
        {i18n.t("navbar.menu")}
      </Typography>
      <List>
        {drawerItems.map((text, index) => (
          <ListItem
            key={text}
            disablePadding
          >
            <ListItemButton>
              <ListItemIcon>{drawerIcons[index]}</ListItemIcon>
              <ListItemText primary={text} />
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
      sx={{ boxShadow: 0 }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer menu"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon className="menu-icon" />
              <Typography>{i18n.t("navbar.menu")}</Typography>
            </IconButton>
            <img
              className="header-logo"
              alt="veridian logo"
              src={Logo}
            />
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
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button onClick={handleDrawerToggle}>
              <img
                className="header-logo"
                alt="veridian-logo"
                src={Logo}
              />
            </Button>
            {drawerItems.map((page, index) => (
              <Button
                key={page}
                onClick={handleDrawerToggle}
              >
                {drawerIcons[index]}
                {page}
              </Button>
            ))}
          </Box>
          <Box>
            <IconButton
              size="large"
              aria-label="show new notifications"
              color="inherit"
            >
              <Badge
                badgeContent={0}
                color="error"
              >
                <NotificationsOutlined />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              aria-label="show settings"
              color="inherit"
            >
              <Badge
                badgeContent={0}
                color="error"
              >
                <SettingsOutlined />
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
