import { MoreVert } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Paper,
  TableCell,
  TableRow,
  Tooltip,
} from "@mui/material";
import { useSnackbar, VariantType } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { AppTable, useTable } from "../../../../components/AppTable";
import { AppTableHeader } from "../../../../components/AppTable/AppTable.types";
import { DropdownMenu } from "../../../../components/DropdownMenu";
import { RoleIndex } from "../../../../components/NavBar/constants/roles";
import { PopupModal } from "../../../../components/PopupModal";
import { i18n } from "../../../../i18n";
import { AppDispatch, RootState } from "../../../../store";
import { useAppSelector } from "../../../../store/hooks";
import { getRoleView } from "../../../../store/reducers/stateCache";
import { formatDate, formatDateTime } from "../../../../utils/dateFormatter";
import { Contact, Data } from "../ConnectionsTable/ConnectionsTable.types";
import { EnhancedTableToolbar } from "./EnhancedTableToolbar";
import { generateRows, handleDeleteContact } from "./helpers";
import { createMenuItems } from "./menuItems";
import { RoutePath } from "../../../../const/route";
import { IssueCredentialModal } from "../../../../components/IssueCredentialModal";
import { RequestPresentationModal } from "../../../../components/RequestPresentationModal";
import { FilterBar } from "../../../../components/FilterBar/FilterBar";
import { filter } from "../../../../components/FilterBar";
import { FilterData } from "../../../../components/FilterBar/FilterBar.types";

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
  const [connectionsFilterBySearch] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>();
  const [openIssueModal, setOpenIssueModal] = useState(false);
  const [openRequestCredModal, setOpenRequestCredModal] = useState(false);
  const [filterData, setFilterData] = useState<FilterData>({
    startDate: null,
    endDate: null,
    keyword: "",
  });

  const nav = useNavigate();

  const rows = useMemo(() => {
    const regex = new RegExp(connectionsFilterBySearch, "gi");
    const filteredContacts = contacts.filter(
      (contact: Contact) => regex.test(contact.alias) || regex.test(contact.id)
    );

    return generateRows(filteredContacts, credentials);
  }, [connectionsFilterBySearch, contacts, credentials]);

  const filterRows = filter(rows, filterData, { date: "date" });

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
    visibleRows,
  } = useTable(filterRows, "date");

  useEffect(() => {
    setSelected([]);
    // We only need to track when the role changes, so we only track the roleViewIndex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleViewIndex]);

  const handleDelete = async () => {
    if (selectedConnectionId) {
      await handleDeleteContact(selectedConnectionId, dispatch, triggerToast);
      setSelectedConnectionId(undefined);
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

  const handOpenConnectionDetails = (id: string) => {
    nav(RoutePath.ConnectionDetails.replace(":id", id));
  };

  const issueCredential = (connectionId: string) => {
    setOpenIssueModal(true);
    setSelectedConnectionId(connectionId);
  };

  const isIssuer = roleViewIndex === RoleIndex.ISSUER;

  const headers: AppTableHeader<Data>[] = useMemo(() => {
    const headers: AppTableHeader<Data>[] = [
      {
        id: "name",
        disablePadding: true,
        label: i18n.t("pages.connections.connectionName"),
      },
      {
        id: "id",
        label: i18n.t("pages.connections.identifier"),
      },
      {
        id: "date",
        label: i18n.t("pages.connections.connectionDate"),
      },
    ];

    if (isIssuer) {
      headers.push({
        id: "credentials",
        label: i18n.t("pages.connections.issuedCredentials"),
      });
    }

    return headers;
  }, [isIssuer]);

  const requestCred = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setOpenRequestCredModal(true);
  };

  return (
    <>
      <FilterBar
        onChange={setFilterData}
        totalFound={filterRows.length}
      />
      <Box sx={{ width: "100%" }}>
        <Paper className="connections-table">
          <EnhancedTableToolbar
            selected={selected}
            setSelected={setSelected}
          />
          <AppTable
            order={order}
            rows={visibleRows}
            onRequestSort={handleRequestSort}
            onSelectAll={handleSelectAllClick}
            selectedRows={selected}
            orderBy={orderBy}
            headers={headers}
            pagination={{
              component: "div",
              count: filterRows.length,
              rowsPerPage: rowsPerPage,
              page: page,
              onPageChange: handleChangePage,
              onRowsPerPageChange: handleChangeRowsPerPage,
            }}
            onRenderRow={(row, index) => {
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
                    <Tooltip
                      title={row.name}
                      placement="top"
                    >
                      <span>{row.name}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    component="th"
                    id={labelId}
                    scope="row"
                    padding="none"
                  >
                    <Tooltip
                      title={row.id}
                      placement="top"
                    >
                      <span>
                        {row.id.substring(0, 4)}...{row.id.slice(-4)}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="left">
                    <Tooltip
                      title={formatDateTime(new Date(row.date))}
                      placement="top"
                    >
                      <span>{formatDate(new Date(row.date))}</span>
                    </Tooltip>
                  </TableCell>
                  {isIssuer && (
                    <TableCell align="left">{row.credentials}</TableCell>
                  )}
                  <TableCell align="left">
                    <DropdownMenu
                      button={
                        <Tooltip
                          className="tooltip"
                          title={i18n.t("pages.connections.actions")}
                          placement="top"
                        >
                          <IconButton aria-label="actions">
                            <MoreVert />
                          </IconButton>
                        </Tooltip>
                      }
                      menuItems={createMenuItems(
                        row.id,
                        roleViewIndex,
                        handleOpenModal,
                        handOpenConnectionDetails,
                        issueCredential,
                        requestCred
                      )}
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
          title={i18n.t("pages.connections.deleteConnections.title")}
          description={i18n.t("pages.connections.deleteConnections.body")}
          footer={
            <>
              <Button
                variant="contained"
                aria-label="cancel delete connection"
                className="neutral-button"
                onClick={() => setOpenModal(false)}
              >
                {i18n.t("pages.connections.deleteConnections.cancel")}
              </Button>
              <Button
                variant="contained"
                aria-label="confirm delete connection"
                className="primary-button"
                onClick={handleDelete}
              >
                {i18n.t("pages.connections.deleteConnections.delete")}
              </Button>
            </>
          }
        />
      </Box>
      <RequestPresentationModal
        open={openRequestCredModal}
        onClose={() => {
          setOpenRequestCredModal(false);
          setSelectedConnectionId(undefined);
        }}
        connectionId={selectedConnectionId}
      />
      <IssueCredentialModal
        open={openIssueModal}
        onClose={() => {
          setOpenIssueModal(false);
          setSelectedConnectionId(undefined);
        }}
        connectionId={selectedConnectionId}
      />
    </>
  );
};

export { ConnectionsTable };
