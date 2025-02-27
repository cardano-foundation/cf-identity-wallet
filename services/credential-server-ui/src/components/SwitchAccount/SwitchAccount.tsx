import { useState, MouseEvent } from "react";
import { Button, Menu, MenuItem, Divider, Typography } from "@mui/material";
import {
  OpenInNewOutlined,
  KeyboardArrowDown,
  CheckCircle,
} from "@mui/icons-material";
import "./SwitchAccount.scss";
import { i18n } from "../../i18n";
import { HolderModal } from "./components/HolderModal";
import { useAppDispatch } from "../../store/hooks";
import { setRoleView } from "../../store/reducers";
import { RoleIndex, roleViewText } from "../../constants/roles";

const SwitchAccount = () => {
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    selectedIndex: RoleIndex.ISSUER,
    selectedView: i18n.t(roleViewText[RoleIndex.ISSUER]),
    anchorEl: null as HTMLElement | null,
    openModal: false,
  });

  const open = Boolean(state.anchorEl);

  const handleOpenModal = () =>
    setState((prevState) => ({ ...prevState, openModal: true }));

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setState((prevState) => ({ ...prevState, anchorEl: event.currentTarget }));
  };

  const handleClose = (index: RoleIndex) => {
    setState((prevState) => ({ ...prevState, anchorEl: null }));

    if (index === RoleIndex.HOLDER) {
      handleOpenModal();
    } else {
      updateSelectedView(index, i18n.t(roleViewText[index]));
    }
  };

  const updateSelectedView = (index: RoleIndex, view: string) => {
    setState((prevState) => ({
      ...prevState,
      selectedIndex: index,
      selectedView: view,
    }));
    dispatch(setRoleView(index));
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
        disableRipple
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
      >
        {state.selectedView}
      </Button>
      <Menu
        id="switchAccountMenu"
        MenuListProps={{
          "aria-labelledby": "switch-account-button",
        }}
        anchorEl={state.anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={open}
        onClose={() => handleClose(state.selectedIndex)}
        className="switch-account-menu"
      >
        <Typography>{i18n.t("navbar.switchaccount.title")}</Typography>
        <MenuItem
          onClick={() => handleClose(RoleIndex.ISSUER)}
          disableRipple
        >
          {i18n.t(roleViewText[RoleIndex.ISSUER])}
          {state.selectedIndex === RoleIndex.ISSUER && (
            <CheckCircle color={"primary"} />
          )}
        </MenuItem>
        <MenuItem
          onClick={() => handleClose(RoleIndex.VERIFIER)}
          disableRipple
        >
          {i18n.t(roleViewText[RoleIndex.VERIFIER])}
          {state.selectedIndex === RoleIndex.VERIFIER && (
            <CheckCircle color={"primary"} />
          )}
        </MenuItem>
        {/* TODO: Hiding these for now until we decide to show the Holder screen again */}
        <Divider
          sx={{ my: 0.5 }}
          className="hidden"
        />
        <MenuItem
          onClick={() => handleClose(RoleIndex.HOLDER)}
          disableRipple
          className="hidden"
        >
          {i18n.t(roleViewText[RoleIndex.HOLDER])}
          <OpenInNewOutlined className="open-new-icon" />
        </MenuItem>
        {/* End */}
      </Menu>
      <HolderModal
        openModal={state.openModal}
        setOpenModal={(open) =>
          setState((prevState) => ({ ...prevState, openModal: open }))
        }
      />
    </div>
  );
};

export { SwitchAccount };
