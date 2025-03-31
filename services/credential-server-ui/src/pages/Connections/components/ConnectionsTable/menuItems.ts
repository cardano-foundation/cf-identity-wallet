import React from "react";
import {
  VisibilityOutlined,
  AddCircleOutlineOutlined,
  DeleteOutline,
  SwapHorizontalCircleOutlined,
} from "@mui/icons-material";
import { i18n } from "../../../../i18n";
import { RoleIndex } from "../../../../components/NavBar/constants/roles";

export const createMenuItems = (
  connectionId: string,
  userRole: RoleIndex,
  handleOpenModal: (connectionId: string) => void,
  handleOpenDetail: (connectionId: string) => void,
  issueCredential: (connectionId: string) => void,
  requestCredential: (connectionId: string) => void
) => {
  const items = [
    {
      label: i18n.t("pages.connections.viewDetails"),
      action: () => handleOpenDetail(connectionId),
      icon: React.createElement(VisibilityOutlined),
      className: "icon-left",
    },
    {
      className: "divider",
    },
    {
      label: i18n.t("pages.connections.delete"),
      action: () => handleOpenModal(connectionId),
      icon: React.createElement(DeleteOutline),
      className: "icon-left action-delete",
    },
  ];

  if (userRole === RoleIndex.ISSUER) {
    items.splice(1, 0, {
      label: i18n.t("pages.connections.issueCredential"),
      icon: React.createElement(AddCircleOutlineOutlined),
      className: "icon-left",
      action: () => issueCredential(connectionId),
    });
  }

  if (userRole === RoleIndex.VERIFIER) {
    items.splice(1, 0, {
      label: i18n.t("pages.connections.requestPresentation"),
      icon: React.createElement(SwapHorizontalCircleOutlined),
      className: "icon-left",
      action: () => requestCredential(connectionId),
    });
  }

  return items;
};
