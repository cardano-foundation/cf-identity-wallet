import AddIcon from "@mui/icons-material/Add";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PageHeader } from "../../components/PageHeader";
import { i18n } from "../../i18n";
import { AppDispatch, RootState } from "../../store";
import { fetchContacts } from "../../store/reducers/connectionsSlice";
import { AddConnectionModal } from "./components/AddConnectionModal";
import { ConnectionsTable } from "./components/ConnectionsTable";
import "./Connections.scss";

const Connections = () => {
  const dispatch = useDispatch<AppDispatch>();
  const contacts = useSelector(
    (state: RootState) => state.connections.contacts
  );
  const [openModal, setOpenModal] = useState(false);

  const handleClick = () => {
    setOpenModal(true);
  };

  const handleGetContacts = () => {
    dispatch(fetchContacts());
  };

  return (
    <Box
      className="connections-page"
      sx={{ padding: "0 2.5rem 2.5rem" }}
    >
      <PageHeader
        title={`${i18n.t("pages.connections.title", {
          number: contacts.length,
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
            startIcon={<AddIcon />}
          >
            {i18n.t("pages.connections.addConnection.title")}
          </Button>
        }
      />
      <AddConnectionModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        handleGetContacts={handleGetContacts}
      />
      <ConnectionsTable />
    </Box>
  );
};

export { Connections };
