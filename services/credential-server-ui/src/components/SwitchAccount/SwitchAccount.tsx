import { useState } from "react";
import { Button } from "@mui/material";
import {
  CheckCircle,
  OpenInNewOutlined,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { i18n } from "../../i18n";
import { HolderModal } from "./components/HolderModal";
import { useAppDispatch } from "../../store/hooks";
import { setRoleView } from "../../store/reducers";
import { RoleIndex, roleViewText } from "../NavBar/constants/roles";
import { DropdownMenu } from "../DropdownMenu/DropdownMenu";

const SwitchAccount = () => {
  const dispatch = useAppDispatch();
  const [state, setState] = useState({
    selectedIndex: RoleIndex.ISSUER,
    selectedView: i18n.t(roleViewText[RoleIndex.ISSUER]),
    openModal: false,
  });

  const handleOpenModal = () =>
    setState((prevState) => ({ ...prevState, openModal: true }));

  const updateSelectedView = (index: RoleIndex, view: string) => {
    setState((prevState) => ({
      ...prevState,
      selectedIndex: index,
      selectedView: view,
    }));
    dispatch(setRoleView(index));
  };

  const menuItems = [
    {
      label: i18n.t(roleViewText[RoleIndex.ISSUER]),
      action: () =>
        updateSelectedView(
          RoleIndex.ISSUER,
          i18n.t(roleViewText[RoleIndex.ISSUER])
        ),
      icon:
        state.selectedIndex === RoleIndex.ISSUER ? (
          <CheckCircle color="primary" />
        ) : (
          <div />
        ),
      className: "icon-right",
    },
    {
      label: i18n.t(roleViewText[RoleIndex.VERIFIER]),
      action: () =>
        updateSelectedView(
          RoleIndex.VERIFIER,
          i18n.t(roleViewText[RoleIndex.VERIFIER])
        ),
      icon:
        state.selectedIndex === RoleIndex.VERIFIER ? (
          <CheckCircle color="primary" />
        ) : (
          <div />
        ),
      className: "icon-right",
    },
    // TODO: Hiding these for now until we decide to show the Holder screen again
    {
      className: "divider hidden",
    },
    {
      label: i18n.t(roleViewText[RoleIndex.HOLDER]),
      action: handleOpenModal,
      icon: <OpenInNewOutlined className="open-new-icon" />,
      className: "icon-right hidden",
    },
    // End TODO
  ];

  const SwitchButton = (
    <Button
      aria-controls={state.openModal ? "dropdown-menu" : undefined}
      aria-haspopup="true"
      aria-expanded={state.openModal ? "true" : undefined}
      variant="contained"
      disableElevation
      disableRipple
      endIcon={<KeyboardArrowDown />}
      className="secondary-button"
    >
      {state.selectedView}
    </Button>
  );

  return (
    <div>
      <DropdownMenu
        button={SwitchButton}
        menuItems={menuItems}
        menuTitle={i18n.t("navbar.switchAccount.title")}
      />
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
