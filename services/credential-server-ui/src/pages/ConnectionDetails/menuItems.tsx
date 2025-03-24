import { BadgeOutlined, DoDisturbOnOutlined } from "@mui/icons-material";
import React from "react";
import { i18n } from "../../i18n";
import { CredentialsTableRow } from "./ConnectionDetails.types";

export const createMenuItems = (
  cred: CredentialsTableRow,
  viewCred: (cred: CredentialsTableRow) => void,
  deleteCred: (cred: CredentialsTableRow) => void
) => [
  {
    label: i18n.t("pages.connectionDetails.table.menu.view"),
    action: () => viewCred(cred),
    icon: React.createElement(BadgeOutlined),
    className: "icon-left",
  },
  {
    className: "divider",
  },
  {
    label: i18n.t("pages.connectionDetails.table.menu.delete"),
    action: () => deleteCred(cred),
    icon: React.createElement(DoDisturbOnOutlined),
    className: "icon-left action-delete",
    disabled: cred.status !== 0,
  },
];
