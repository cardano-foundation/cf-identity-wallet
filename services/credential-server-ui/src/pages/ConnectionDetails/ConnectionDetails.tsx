import AddIcon from "@mui/icons-material/Add";
import { Box, Button } from "@mui/material";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { RoleIndex } from "../../components/NavBar/constants/roles";
import { PageHeader } from "../../components/PageHeader";
import { i18n } from "../../i18n";
import { useAppSelector } from "../../store/hooks";
import { getRoleView } from "../../store/reducers";
import { ConnectionContactCard } from "./ConnectionContactCard";
import { CredentialsTable } from "./CredentialsTable";

export const ConnectionDetails = () => {
  const roleViewIndex = useAppSelector(getRoleView) as RoleIndex;
  const contacts = useAppSelector((state) => state.connections.contacts);
  const credentials = useAppSelector((state) => state.connections.credentials);
  const nav = useNavigate();
  const { id } = useParams();

  const contact = useMemo(
    () => contacts.find((item) => item.id === id),
    [contacts, id]
  );

  const contactCredentials = useMemo(
    () => credentials.filter((item) => item.contactId === contact?.id),
    [contact?.id, credentials]
  );

  return (
    <Box
      className="connection-detail-page"
      sx={{ padding: "0 2.5rem 2.5rem" }}
    >
      <PageHeader
        // TODO: Temporarily pointing to "/" until Overview page is ready
        //onBack={() => nav(RoutePath.Connections)}
        onBack={() => nav("/")}
        title={`${i18n.t("pages.connectionDetails.title")}`}
        action={
          roleViewIndex === 0 && (
            <Button
              variant="contained"
              disableElevation
              disableRipple
              startIcon={<AddIcon />}
            >
              {i18n.t("pages.connectionDetails.issue")}
            </Button>
          )
        }
        sx={{
          margin: "1.5rem 0",
        }}
      />
      <Box
        sx={(theme) => ({
          display: "flex",
          gap: 2,
          [theme.breakpoints.down("md")]: {
            flexDirection: "column",
          },
        })}
      >
        <ConnectionContactCard
          contact={contact}
          credentials={contactCredentials}
        />
        <CredentialsTable
          credentials={contactCredentials}
          contactId={contact?.id}
        />
      </Box>
    </Box>
  );
};
