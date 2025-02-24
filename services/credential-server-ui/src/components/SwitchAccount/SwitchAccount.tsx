import { useState } from "react";
import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import "./SwitchAccount.scss";
import { i18n } from "../../i18n";
import Typography from "@mui/material/Typography";

const SwitchAccount = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="switchAccountButton"
        className="switch-account-button"
        aria-controls={open ? "switch-account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Options {/*  TODO: Change based on selection */}
      </Button>
      <Menu
        id="switchAccountMenu"
        MenuListProps={{
          "aria-labelledby": "switch-account-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className="switch-account-menu"
      >
        <Typography>{i18n.t("navbar.switchaccount.title")}</Typography>
        <MenuItem
          onClick={handleClose}
          disableRipple
        >
          {i18n.t("navbar.switchaccount.issuer")}
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          disableRipple
        >
          {i18n.t("navbar.switchaccount.verifier")}
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={handleClose}
          disableRipple
        >
          {i18n.t("navbar.switchaccount.holder")}
          <OpenInNewOutlinedIcon className="open-new-icon" />
        </MenuItem>
      </Menu>
    </div>
  );
};

export { SwitchAccount };
