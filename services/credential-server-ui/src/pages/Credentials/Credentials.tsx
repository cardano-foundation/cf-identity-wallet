import { MoreVert } from "@mui/icons-material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  IconButton,
  Paper,
  TableCell,
  TableRow,
  Tooltip,
} from "@mui/material";
import { AppTable, useTable } from "../../components/AppTable";
import { AppTableHeader } from "../../components/AppTable/AppTable.types";
import { DropdownMenu } from "../../components/DropdownMenu";
import { PageHeader } from "../../components/PageHeader";
import { CredentialTypes } from "../../const";
import { i18n } from "../../i18n";
import { formatDate } from "../../utils/dateFormatter";
import { CredentialTemplateRow } from "./Credential.types";
import { useAppSelector } from "../../store/hooks";
import { getRoleView } from "../../store/reducers";
import { RoleIndex } from "../../components/NavBar/constants/roles";

const headers: AppTableHeader<CredentialTemplateRow>[] = [
  {
    id: "name",
    label: i18n.t("pages.credentials.table.template"),
  },
  {
    id: "date",
    label: i18n.t("pages.credentials.table.creationDate"),
  },
];

export const Credentials = () => {
  const roleViewIndex = useAppSelector(getRoleView) as RoleIndex;
  const tableRows: CredentialTemplateRow[] = CredentialTypes.map(
    (row, idx) => ({
      id: `${idx}`,
      name: row,
      date: new Date().getTime(),
    })
  );

  const {
    order,
    orderBy,
    page,
    rowsPerPage,
    handleRequestSort,
    handleChangePage,
    handleChangeRowsPerPage,
    visibleRows,
  } = useTable(tableRows, "name");

  const viewCredTemplate = () => {};

  const issueCred = () => {};

  return (
    <Box
      className="credentials-page"
      sx={{ padding: "0 2.5rem 2.5rem" }}
    >
      <PageHeader
        title={`${i18n.t("pages.credentials.title", {
          number: CredentialTypes.length,
        })}`}
        sx={{
          margin: "1.5rem 0",
        }}
      />
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
          onRenderRow={(row) => {
            return (
              <TableRow
                hover
                role="checkbox"
                tabIndex={-1}
                key={row.id}
                className="table-row"
              >
                <TableCell
                  component="th"
                  scope="row"
                >
                  {row.name}
                </TableCell>
                <TableCell
                  component="th"
                  scope="row"
                >
                  {formatDate(new Date(row.date))}
                </TableCell>
                <TableCell align="left">
                  <DropdownMenu
                    button={
                      <Tooltip
                        title={i18n.t("pages.credentials.actions")}
                        placement="top"
                      >
                        <IconButton aria-label="actions">
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    }
                    menuItems={[
                      {
                        label: i18n.t("pages.credentials.table.menu.view"),
                        action: () => viewCredTemplate(),
                        icon: <VisibilityOutlinedIcon />,
                        className: "icon-left",
                      },
                      ...(roleViewIndex === RoleIndex.ISSUER
                        ? [
                            {
                              className: "divider",
                            },
                            {
                              label: i18n.t(
                                "pages.credentials.table.menu.issue"
                              ),
                              action: () => issueCred(),
                              icon: <AddCircleOutlineOutlinedIcon />,
                              className: "icon-left",
                            },
                          ]
                        : []),
                    ]}
                  />
                </TableCell>
              </TableRow>
            );
          }}
          onRequestSort={handleRequestSort}
          orderBy={orderBy}
          headers={headers}
          pagination={{
            component: "div",
            count: CredentialTypes.length,
            rowsPerPage: rowsPerPage,
            page: page,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleChangeRowsPerPage,
          }}
        />
      </Paper>
    </Box>
  );
};
