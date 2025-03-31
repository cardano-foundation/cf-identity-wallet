import { AddCircleOutline } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { RoleIndex } from "../../components/NavBar/constants/roles";
import { PageHeader } from "../../components/PageHeader";
import { i18n } from "../../i18n";
import { useAppSelector } from "../../store/hooks";
import { getRoleView } from "../../store/reducers";
import { ConnectionContactCard } from "./ConnectionContactCard";
import { CredentialsTable } from "./CredentialsTable";
import "./ConnectionDetails.scss";
import { IssueCredentialModal } from "../../components/IssueCredentialModal";

export const ConnectionDetails = () => {
  const [open, setOpen] = useState(false);
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
    <>
      <Box className="connection-details-page">
        <PageHeader
          onBack={() => nav(-1)}
          title={`${i18n.t("pages.connectionDetails.title")}`}
          action={
            roleViewIndex === 0 && (
              <Button
                variant="contained"
                disableElevation
                disableRipple
                startIcon={<AddCircleOutline />}
                onClick={() => setOpen(true)}
              >
                {i18n.t("pages.connectionDetails.issue")}
              </Button>
            )
          }
        />
        <Box className="connection-details-page-container">
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
      <IssueCredentialModal
        open={open}
        onClose={() => setOpen(false)}
        connectionId={contact?.id}
      />
    </>
  );
};
