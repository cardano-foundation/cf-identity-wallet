import { BadgeOutlined, DoDisturbOnOutlined } from "@mui/icons-material";
import React from "react";
import { i18n } from "../../i18n";
import { CredentialTableRow } from "./ConnectionDetail.types";

export const createMenuItems = (
  cred: CredentialTableRow,
  viewCred: (cred: CredentialTableRow) => void,
  deleteCred: (cred: CredentialTableRow) => void
) => [
  {
    label: i18n.t("pages.connectiondetail.table.menu.view"),
    action: () => viewCred(cred),
    icon: React.createElement(BadgeOutlined),
    className: "icon-left",
  },
  {
    className: "divider",
  },
  {
    label: i18n.t("pages.connectiondetail.table.menu.delete"),
    action: () => deleteCred(cred),
    icon: React.createElement(DoDisturbOnOutlined),
    className: "icon-left action-delete",
    disabled: cred.status !== 0,
  },
];
