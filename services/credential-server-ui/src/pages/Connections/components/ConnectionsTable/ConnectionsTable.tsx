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
import { formatDate } from "../../../../utils/dateFormatter";
import { DropdownMenu } from "../../../../components/DropdownMenu";
import { i18n } from "../../../../i18n";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchContacts,
  fetchContactCredentials,
} from "../../../../store/reducers/connectionsSlice";
import { RootState, AppDispatch } from "../../../../store";
import { Contact, Data } from "../../../../types";

const ConnectionsTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const contacts = useSelector(
    (state: RootState) => state.connections.contacts
  );
  const credentials = useSelector(
    (state: RootState) => state.connections.credentials
  );
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  // TODO: implement search filter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [connectionsFilterBySearch, setConnectionsFilterBySearch] =
    useState<string>("");

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  useEffect(() => {
    contacts.forEach((contact) => {
      dispatch(fetchContactCredentials(contact.id));
    });
  }, [contacts, dispatch]);

  useEffect(() => {
    const regex = new RegExp(connectionsFilterBySearch, "gi");
    const filteredContacts = contacts.filter(
      (contact: Contact) => regex.test(contact.alias) || regex.test(contact.id)
    );
    setFilteredContacts(filteredContacts);
  }, [connectionsFilterBySearch, contacts]);

  const generateRows = () => {
    const rows = filteredContacts.map((contact) => {
      const contactCredentials = credentials.filter(
        (cred) => cred.contactId === contact.id
      );
      return {
        id: contact.id,
        name: contact.alias,
        date: "2020-03-15T12:34:56Z", // TODO: Temporary hardcoded date
        credentials: contactCredentials.length,
      };
    });
    return rows;
  };

  const [rows, setRows] = useState<Data[]>([]);

  useEffect(() => {
    const generatedRows = generateRows();
    setRows(generatedRows);
  }, [filteredContacts, credentials]);

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
