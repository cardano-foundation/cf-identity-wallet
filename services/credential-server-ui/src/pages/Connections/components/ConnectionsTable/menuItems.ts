import React from "react";
import {
  VisibilityOutlined,
  AddCircleOutlineOutlined,
  DeleteOutline,
} from "@mui/icons-material";
import { i18n } from "../../../../i18n";
import { AppDispatch } from "../../../../store";

export const createMenuItems = (
  dispatch: AppDispatch,
  connectionId: string,
  handleOpenModal: (connectionId: string) => void
) => [
  {
    label: i18n.t("pages.connections.viewDetails"),
    action: () => console.log(i18n.t("pages.connections.viewDetails")),
    icon: React.createElement(VisibilityOutlined),
    className: "icon-left",
  },
  {
    label: i18n.t("pages.connections.issueCredential"),
    action: () => console.log(i18n.t("pages.connections.issueCredential")),
    icon: React.createElement(AddCircleOutlineOutlined),
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
