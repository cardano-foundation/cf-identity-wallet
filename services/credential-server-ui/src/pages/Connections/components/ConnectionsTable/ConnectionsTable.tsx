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
  Button,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { useSnackbar, VariantType } from "notistack";
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
import { Contact, Data } from "../ConnectionsTable/ConnectionsTable.types";
import { createMenuItems } from "./menuItems";
import { generateRows, handleDeleteContact } from "./helpers";
import { PopupModal } from "../../../../components/PopupModal";
import { useAppSelector } from "../../../../store/hooks";
import { getRoleView } from "../../../../store/reducers/stateCache";
import { MIN_TABLE_WIDTH, ROWS_PER_PAGE_OPTIONS } from "./constants";
import { RoleIndex } from "../../../../components/NavBar/constants/roles";

const ConnectionsTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { enqueueSnackbar } = useSnackbar();
  const roleViewIndex = useAppSelector(getRoleView) as RoleIndex;
  const contacts = useSelector(
    (state: RootState) => state.connections.contacts
  );
  const credentials = useSelector(
    (state: RootState) => state.connections.credentials
  );
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [connectionsFilterBySearch, setConnectionsFilterBySearch] =
    useState<string>("");
  const [numSelected, setNumSelected] = useState<number>(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);

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

  const [rows, setRows] = useState<Data[]>([]);

  useEffect(() => {
    const generatedRows = generateRows(filteredContacts, credentials);
    setRows(generatedRows);
  }, [filteredContacts, credentials]);

  useEffect(() => {
    setSelected([]);
    setNumSelected(0);
    // We only need to track when the role changes, so we only track the roleViewIndex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleViewIndex]);

  const {
    order,
    orderBy,
    selected,
    setSelected,
    page,
    rowsPerPage,
    handleRequestSort,
    handleSelectAllClick,
    handleClick,
    handleChangePage,
    handleChangeRowsPerPage,
    emptyRows,
    visibleRows,
  } = useTable(rows, setNumSelected);

  const handleDelete = async () => {
    if (selectedConnectionId) {
      await handleDeleteContact(selectedConnectionId, dispatch, triggerToast);
      setSelectedConnectionId(null);
      setOpenModal(false);
    }
  };

  const handleOpenModal = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setOpenModal(true);
  };

  const triggerToast = (message: string, variant: VariantType) => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: { vertical: "top", horizontal: "center" },
    });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper className="connections-table">
        <EnhancedTableToolbar
          numSelected={numSelected}
          setNumSelected={setNumSelected}
          selected={selected}
          setSelected={setSelected}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: MIN_TABLE_WIDTH }}
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
                        slotProps={{ input: { "aria-labelledby": labelId } }}
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
                        menuItems={createMenuItems(
                          dispatch,
                          row.id,
                          handleOpenModal
                        )}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 &&
                Array.from({ length: emptyRows }).map((_, index) => (
                  <TableRow key={`empty-row-${index}`}>
                    <TableCell colSpan={6} />
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Paper>
      <PopupModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={i18n.t("pages.connections.deleteConnections.title")}
        body={i18n.t("pages.connections.deleteConnections.body")}
        footer={
          <>
            <Button
              variant="contained"
              aria-label="cancel delete connection"
              onClick={() => setOpenModal(false)}
            >
              {i18n.t("pages.connections.deleteConnections.cancel")}
            </Button>
            <Button
              variant="contained"
              aria-label="confirm delete connection"
              onClick={handleDelete}
            >
              {i18n.t("pages.connections.deleteConnections.delete")}
            </Button>
          </>
        }
      />
    </Box>
  );
};

export { ConnectionsTable };
