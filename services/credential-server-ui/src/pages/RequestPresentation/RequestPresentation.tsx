import { SwapHorizontalCircleOutlined } from "@mui/icons-material";
import { Box, Button, Paper, TableCell, TableRow } from "@mui/material";
import { useState } from "react";
import { AppTable, useTable } from "../../components/AppTable";
import { AppTableHeader } from "../../components/AppTable/AppTable.types";
import { PageHeader } from "../../components/PageHeader";
import { RequestPresentationModal } from "../../components/RequestPresentationModal";
import { CredentialTypes } from "../../const";
import { i18n } from "../../i18n";
import { useAppSelector } from "../../store/hooks";
import { PresentationRequestData } from "../../store/reducers/connectionsSlice.types";
import { formatDate } from "../../utils/dateFormatter";
import "./RequestPresentation.scss";

const headers: AppTableHeader<PresentationRequestData>[] = [
  {
    id: "connectionName",
    label: i18n.t("pages.requestPresentation.table.name"),
  },
  {
    id: "credentialType",
    label: i18n.t("pages.requestPresentation.table.credential"),
  },
  {
    id: "requestDate",
    label: i18n.t("pages.requestPresentation.table.requestDate"),
  },
  {
    id: "status",
    label: i18n.t("pages.requestPresentation.table.status.header"),
  },
];

export const RequestPresentation = () => {
  const presentationRequests = useAppSelector(
    (state) => state.connections.presentationRequests
  );
  const [openModal, setOpenModal] = useState(false);

  const {
    order,
    orderBy,
    page,
    rowsPerPage,
    handleRequestSort,
    handleChangePage,
    handleChangeRowsPerPage,
    visibleRows,
  } = useTable(presentationRequests, "requestDate");

  const handleClick = () => {
    setOpenModal(true);
  };

  return (
    <>
      <Box
        className="request-presentation-page"
        sx={{ padding: "0 2.5rem 2.5rem" }}
      >
        <PageHeader
          title={`${i18n.t("pages.requestPresentation.title", {
            number: presentationRequests.length,
          })}`}
          sx={{
            margin: "1.5rem 0",
          }}
          action={
            <Button
              className="add-connection-button primary-button"
              aria-haspopup="true"
              variant="contained"
              disableElevation
              disableRipple
              onClick={handleClick}
              startIcon={<SwapHorizontalCircleOutlined />}
            >
              {i18n.t("pages.requestPresentation.action")}
            </Button>
          }
        />
        <Paper className="request-presentation-table">
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
                    {row.connectionName}
                  </TableCell>
                  <TableCell
                    component="th"
                    scope="row"
                  >
                    {row.credentialType}
                  </TableCell>
                  <TableCell
                    component="th"
                    scope="row"
                  >
                    {formatDate(new Date(row.requestDate))}
                  </TableCell>
                  <TableCell align="left">
                    <Box className={`label ${row.status}`}>
                      {i18n.t(
                        "pages.requestPresentation.table.status.requested"
                      )}
                    </Box>
                  </TableCell>
                  <TableCell />
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
      <RequestPresentationModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
        }}
      />
    </>
  );
};
