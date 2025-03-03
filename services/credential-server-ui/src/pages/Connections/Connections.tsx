import { i18n } from "../../i18n";
import AddIcon from "@mui/icons-material/Add";
import { useAppSelector } from "../../store/hooks";
import { getRoleView } from "../../store/reducers/stateCache";
import { RoleIndex } from "../../constants/roles";
import { ConnectionsTable } from "./components/ConnectionsTable";
import { Button } from "@mui/material";
import "./Connections.scss";
import { rows } from "./components/ConnectionsTable/data";

const Connections = () => {
  const roleViewIndex = useAppSelector(getRoleView) as RoleIndex;

  const handleClick = () => {
    // TODO: Implement this
  };

  return (
    <div className="connections-page">
      <div className="connections-page-header">
        <h1>{i18n.t("pages.connections.title", { count: rows.length })}</h1>
        {roleViewIndex == 0 && (
          <Button
            className="add-connection-button"
            aria-haspopup="true"
            variant="contained"
            disableElevation
            disableRipple
            onClick={handleClick}
            startIcon={<AddIcon />}
          >
            {i18n.t("pages.connections.addConnection")}
          </Button>
        )}
      </div>

      <ConnectionsTable />
    </div>
  );
};

export { Connections };
