import {
  BadgeOutlined,
  DoDisturbOnOutlined,
  MoreVert,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Paper,
  TableCell,
  TableRow,
  Tooltip,
} from "@mui/material";
import { enqueueSnackbar, VariantType } from "notistack";
import { useState } from "react";
import { AppTable, useTable } from "../../components/AppTable";
import { AppTableHeader } from "../../components/AppTable/AppTable.types";
import { DropdownMenu } from "../../components/DropdownMenu";
import { PopupModal } from "../../components/PopupModal";
import { i18n } from "../../i18n";
import { CredentialService } from "../../services";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchContactCredentials } from "../../store/reducers/connectionsSlice";
import { formatDate } from "../../utils/dateFormatter";
import {
  CredentialsTableProps,
  CredentialsTableRow,
} from "./ConnectionDetails.types";
import { getRoleView } from "../../store/reducers";
import { RoleIndex } from "../../components/NavBar/constants/roles";
const headers: AppTableHeader<CredentialsTableRow>[] = [
  {
    id: "name",
    label: i18n.t("pages.connectionDetails.table.headers.name"),
  },
  {
    id: "date",
    disablePadding: false,
    label: i18n.t("pages.connectionDetails.table.headers.issueDate"),
  },
  {
    id: "status",
    disablePadding: false,
    label: i18n.t("pages.connectionDetails.table.headers.status"),
  },
];

const CredentialsTable = ({
  credentials,
  contactId,
}: CredentialsTableProps) => {
  const roleViewIndex = useAppSelector(getRoleView) as RoleIndex;
  const dispatch = useAppDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [revokeCredItem, setRevokeCredItem] =
    useState<CredentialsTableRow | null>(null);
  const tableRows: CredentialsTableRow[] = credentials.map((row) => ({
    id: row.status.i,
    name: row.schema.title,
    date: new Date(row.status.dt).getTime(),
    status: Number(row.status.s),
    data: row,
  }));

  const {
    order,
    orderBy,
    selected,
    page,
    rowsPerPage,
    handleRequestSort,
    handleChangePage,
    handleChangeRowsPerPage,
    visibleRows,
  } = useTable(tableRows, "name");

  const triggerToast = (message: string, variant: VariantType) => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: { vertical: "top", horizontal: "center" },
    });
  };

  const viewCred = () => {};

  const revokeCred = async () => {
    setOpenModal(false);
    if (!contactId || !revokeCredItem) return;

    setRevokeCredItem(null);
    try {
      const response = await CredentialService.revoke(
        contactId,
        revokeCredItem.id
      );
      if (response.status === 200) {
        triggerToast(
          i18n.t("pages.connectionDetails.table.toast.success"),
          "success"
        );
      } else {
        triggerToast(
          i18n.t("pages.connectionDetails.table.toast.error"),
          "error"
        );
      }

      dispatch(fetchContactCredentials(contactId));
    } catch (error) {
      triggerToast(
        i18n.t("pages.connectionDetails.table.toast.error"),
        "error"
      );
      console.error("Error deleting contact:", error);
    }
  };

  const openRevokeConfirm = (cred: CredentialsTableRow) => {
    setRevokeCredItem(cred);
    setOpenModal(true);
  };

  return (
    <>
      <Paper
        sx={{
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow:
            "0.25rem 0.25rem 1.25rem 0 rgba(var(--text-color-rgb), 0.16)",
          flex: 1,
        }}
        className="credential-table"
      >
        <AppTable
          order={order}
          rows={visibleRows}
          onRequestSort={handleRequestSort}
          orderBy={orderBy}
          headers={headers}
          pagination={{
            component: "div",
            count: credentials.length,
            rowsPerPage: rowsPerPage,
            page: page,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleChangeRowsPerPage,
          }}
          onRenderRow={(row, index) => {
            const isItemSelected = selected.includes(row.id);
            const labelId = `enhanced-table-checkbox-${index}`;
            const isRevoked = row.status !== 0;

            return (
              <TableRow
                hover
                role="checkbox"
                aria-checked={isItemSelected}
                tabIndex={-1}
                key={row.id}
                selected={isItemSelected}
                className="table-row"
              >
                <TableCell
                  component="th"
                  id={labelId}
                  scope="row"
                >
                  {row.name}
                </TableCell>
                <TableCell align="left">
                  {formatDate(new Date(row.date))}
                </TableCell>
                <TableCell align="left">
                  <Box
                    sx={(theme) => ({
                      background: isRevoked
                        ? theme.palette.error.main
                        : theme.palette.success.light,
                      color: isRevoked
                        ? theme.palette.error.contrastText
                        : theme.palette.success.main,
                      padding: "0.25rem 0.75rem",
                      width: "fit-content",
                      fontSize: "0.75rem",
                      lineHeight: "1.25rem",
                      borderRadius: "0.5rem",
                    })}
                  >
                    {!isRevoked
                      ? i18n.t("pages.connectionDetails.table.status.issued")
                      : i18n.t("pages.connectionDetails.table.status.revoked")}
                  </Box>
                </TableCell>
                <TableCell align="left">
                  <DropdownMenu
                    button={
                      <Tooltip
                        title={i18n.t("pages.connections.actions")}
                        placement="top"
                      >
                        <IconButton aria-label="actions">
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    }
                    menuItems={[
                      {
                        label: i18n.t(
                          "pages.connectionDetails.table.menu.view"
                        ),
                        action: () => viewCred(),
                        icon: <BadgeOutlined />,
                        className: "icon-left",
                      },
                      ...(roleViewIndex === RoleIndex.ISSUER
                        ? [
                            {
                              className: "divider",
                            },
                            {
                              label: i18n.t(
                                "pages.connectionDetails.table.menu.delete"
                              ),
                              action: () => openRevokeConfirm(row),
                              icon: <DoDisturbOnOutlined />,
                              className: "icon-left action-delete",
                              disabled: row.status !== 0,
                            },
                          ]
                        : []),
                    ]}
                  />
                </TableCell>
              </TableRow>
            );
          }}
        />
      </Paper>
      <PopupModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={i18n.t("pages.connectionDetails.table.confirm.title")}
        description={i18n.t("pages.connectionDetails.table.confirm.body")}
        footer={
          <>
            <Button
              variant="contained"
              aria-label="cancel delete connection"
              onClick={() => setOpenModal(false)}
              className="neutral-button"
            >
              {i18n.t("pages.connectionDetails.table.confirm.cancel")}
            </Button>
            <Button
              variant="contained"
              aria-label="confirm delete connection"
              onClick={revokeCred}
              className="primary-button"
            >
              {i18n.t("pages.connectionDetails.table.confirm.confirm")}
            </Button>
          </>
        }
      />
    </>
  );
};

export { CredentialsTable };
