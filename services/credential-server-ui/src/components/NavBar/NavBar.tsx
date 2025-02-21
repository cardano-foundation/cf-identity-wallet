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
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import WindowIcon from "@mui/icons-material/Window";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import Logo from "../../assets/Logo.svg";
import "./NavBar.scss";
import { CustomMenu } from "../Menu";

interface Props {
  window?: () => Window;
}

const drawerWidth = 240;
const drawerItems = ["Overview", "Contacts", "Credentials"];
const drawerIcons = [
  <WindowIcon />,
  <PeopleOutlinedIcon />,
  <CreditCardOutlined />,
];

const NavBar = (props: Props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ textAlign: "left" }}
    >
      <Typography
        variant="h6"
        sx={{ my: 2 }}
      >
        Menu
      </Typography>
      <Divider />
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
      position="static"
      className="navbar"
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
              <MenuIcon />
              <Typography>Menu</Typography>
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
            <Button
              onClick={handleDrawerToggle}
              sx={{ color: "white", display: "block" }}
            >
              <img
                className="header-logo"
                alt="veridian-logo"
                src={Logo}
              />
            </Button>
            {drawerItems.map((page) => (
              <Button
                key={page}
                onClick={handleDrawerToggle}
                sx={{ my: 2, color: "white", display: "block" }}
              >
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
                <NotificationsIcon />
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
                <SettingsIcon />
              </Badge>
            </IconButton>
          </Box>
          <CustomMenu />
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export { NavBar };
