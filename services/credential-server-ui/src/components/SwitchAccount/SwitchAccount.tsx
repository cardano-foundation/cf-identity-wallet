import { useEffect, useState, MouseEvent } from "react";
import { Button, Menu, MenuItem, Divider, Typography } from "@mui/material";
import {
  OpenInNewOutlined,
  KeyboardArrowDown,
  CheckCircle,
} from "@mui/icons-material";
import "./SwitchAccount.scss";
import { i18n } from "../../i18n";
import { HolderModal } from "./components/HolderModal";

const SwitchAccount = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedView, setSelectedView] = useState(
    i18n.t("navbar.switchaccount.issuer")
  );
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (index: number) => {
    setAnchorEl(null);
    setSelectedIndex(index);
  };

  useEffect(() => {
    if (selectedIndex === 0) {
      setSelectedView(i18n.t("navbar.switchaccount.issuer"));
    } else if (selectedIndex === 1) {
      setSelectedView(i18n.t("navbar.switchaccount.verifier"));
    } else {
      setSelectedView(i18n.t("navbar.switchaccount.holder"));
      setSelectedIndex(0);
      handleOpenModal();
    }
  }, [selectedIndex]);

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
        endIcon={<KeyboardArrowDown />}
      >
        {selectedView}
      </Button>
      <Menu
        id="switchAccountMenu"
        MenuListProps={{
          "aria-labelledby": "switch-account-button",
        }}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={open}
        onClose={() => handleClose(selectedIndex)}
        className="switch-account-menu"
      >
        <Typography>{i18n.t("navbar.switchaccount.title")}</Typography>
        <MenuItem
          onClick={() => handleClose(0)}
          disableRipple
        >
          {i18n.t("navbar.switchaccount.issuer")}
          {selectedIndex === 0 && <CheckCircle color={"primary"} />}
        </MenuItem>
        <MenuItem
          onClick={() => handleClose(1)}
          disableRipple
        >
          {i18n.t("navbar.switchaccount.verifier")}
          {selectedIndex === 1 && <CheckCircle color={"primary"} />}
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => handleClose(2)}
          disableRipple
        >
          {i18n.t("navbar.switchaccount.holder")}
          <OpenInNewOutlined className="open-new-icon" />
        </MenuItem>
      </Menu>
      <HolderModal
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </div>
  );
};

export { SwitchAccount };
