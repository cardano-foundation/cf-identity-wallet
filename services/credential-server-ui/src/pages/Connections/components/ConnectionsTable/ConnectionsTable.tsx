import * as React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Checkbox,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AddCircleOutlineOutlined,
  DeleteOutline,
  MoreVert,
  VisibilityOutlined,
} from "@mui/icons-material";
import { EnhancedTableHead } from "./EnhancedTableHead";
import { EnhancedTableToolbar } from "./EnhancedTableToolbar";
import { useTable } from "./useTable";
import { rows } from "./data";
import { formatDate } from "../../../../utils/dateFormatter"; // Import the date formatting function
import { DropdownMenu } from "../../../../components/DropdownMenu";
import { i18n } from "../../../../i18n";

const ConnectionsTable: React.FC = () => {
  const {
    order,
    orderBy,
    selected,
    page,
    rowsPerPage,
    handleRequestSort,
    handleSelectAllClick,
    handleClick,
    handleChangePage,
    handleChangeRowsPerPage,
    emptyRows,
    visibleRows,
  } = useTable(rows);

  const ActionButton = (
    <Tooltip
      title={i18n.t("pages.connections.actions")}
      placement="top"
    >
      <IconButton aria-label="actions">
        <MoreVert />
      </IconButton>
    </Tooltip>
  );

  const menuItems = [
    {
      label: i18n.t("pages.connections.viewDetails"),
      action: () => console.log(i18n.t("pages.connections.viewDetails")),
      icon: <VisibilityOutlined />,
      className: "icon-left",
    },
    {
      label: i18n.t("pages.connections.issueCredential"),
      action: () => console.log(i18n.t("pages.connections.issueCredential")),
      icon: <AddCircleOutlineOutlined />,
      className: "icon-left",
    },
    {
      className: "divider",
    },
    {
      label: i18n.t("pages.connections.delete"),
      action: () => console.log(i18n.t("pages.connections.delete")),
      icon: <DeleteOutline />,
      className: "icon-left action-delete",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Paper className="connections-table">
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          "aria-labelledby": labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.name}
                    </TableCell>
                    <TableCell align="left">{formatDate(row.date)}</TableCell>
                    <TableCell align="left">{row.credentials}</TableCell>
                    <TableCell align="left">
                      <DropdownMenu
                        button={ActionButton}
                        menuItems={menuItems}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Paper>
    </Box>
  );
};

export { ConnectionsTable };
