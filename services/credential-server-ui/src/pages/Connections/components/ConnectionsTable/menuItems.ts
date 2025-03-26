import React from "react";
import {
  VisibilityOutlined,
  AddCircleOutlineOutlined,
  DeleteOutline,
} from "@mui/icons-material";
import { i18n } from "../../../../i18n";

export const createMenuItems = (
  connectionId: string,
  handleOpenModal: (connectionId: string) => void,
  handleOpenDetail: (connectionId: string) => void,
  issueCredential: (connectionId: string) => void
) => [
  {
    label: i18n.t("pages.connections.viewDetails"),
    action: () => handleOpenDetail(connectionId),
    icon: React.createElement(VisibilityOutlined),
    className: "icon-left",
  },
  {
    label: i18n.t("pages.connections.issueCredential"),
    icon: React.createElement(AddCircleOutlineOutlined),
    className: "icon-left",
    action: () => issueCredential(connectionId),
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
