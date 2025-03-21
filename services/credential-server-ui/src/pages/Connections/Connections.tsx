import { i18n } from "../../i18n";
import AddIcon from "@mui/icons-material/Add";
import { useAppSelector } from "../../store/hooks";
import { getRoleView } from "../../store/reducers/stateCache";
import { RoleIndex } from "../../components/NavBar/constants/roles";
import { ConnectionsTable } from "./components/ConnectionsTable";
import { Button } from "@mui/material";
import "./Connections.scss";
import { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { AddConnectionModal } from "./components/AddConnectionModal";
import { fetchContacts } from "../../store/reducers/connectionsSlice";

const Connections = () => {
  const dispatch = useDispatch<AppDispatch>();
  const roleViewIndex = useAppSelector(getRoleView) as RoleIndex;
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
    <div className="connections-page">
      <div className="connections-page-header">
        <h1>{i18n.t("pages.connections.title", { count: contacts.length })}</h1>
        {roleViewIndex == 0 && (
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
        )}
        <AddConnectionModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          handleGetContacts={handleGetContacts}
        />
      </div>
      <ConnectionsTable />
    </div>
  );
};

export { Connections };
