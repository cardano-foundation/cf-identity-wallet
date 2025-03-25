import { DeleteOutline } from "@mui/icons-material";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { enqueueSnackbar, VariantType } from "notistack";
import { useState } from "react";
import { useNavigate } from "react-router";
import { PopupModal } from "../../components/PopupModal";
import { RoutePath } from "../../const/route";
import { i18n } from "../../i18n";
import { ContactService } from "../../services";
import { useAppDispatch } from "../../store/hooks";
import { fetchContacts } from "../../store/reducers/connectionsSlice";
import { formatDate } from "../../utils/dateFormatter";
import { ConnectionContactCardProps } from "./ConnectionDetails.types";

const ConnectionContactCard = ({
  contact,
  credentials,
}: ConnectionContactCardProps) => {
  const dispatch = useAppDispatch();
  const [openModal, setOpenModal] = useState(false);
  const nav = useNavigate();

  const triggerToast = (message: string, variant: VariantType) => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: { vertical: "top", horizontal: "center" },
    });
  };

  const handleDeleteContact = async () => {
    if (!contact) return;

    try {
      const response = await ContactService.delete(contact.id);
      if (response.status === 200) {
        triggerToast(
          i18n.t("pages.connections.deleteConnections.toast.success"),
          "success"
        );
      } else {
        triggerToast(
          i18n.t("pages.connections.deleteConnections.toast.error"),
          "error"
        );
      }
      dispatch(fetchContacts());
      nav(RoutePath.Connections);
    } catch (error) {
      triggerToast(
        i18n.t("pages.connections.deleteConnections.toast.error"),
        "error"
      );
      console.error("Error deleting contact:", error);
    }
  };

  return (
    <>
      <Box
        sx={(theme) => ({
          padding: "1.5rem",
          borderRadius: "1rem",
          boxShadow:
            "0.25rem 0.25rem 1.25rem 0 rgba(var(--text-color-rgb), 0.16)",
          width: 300,
          height: "fit-content",
          [theme.breakpoints.down("sm")]: {
            width: "auto",
            minWidth: 300,
          },
        })}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            marginBottom: "1.5rem",
          }}
        >
          <Avatar alt={contact?.alias || ""} />
          <Typography>{contact?.alias}</Typography>
        </Box>
        <Box sx={{ textAlign: "left", marginBottom: "1.5rem" }}>
          <Typography variant="subtitle1">
            {i18n.t("pages.connectionDetails.userinfo.connectionDate")}
          </Typography>
          <Typography variant="body2">{formatDate(new Date())}</Typography>
        </Box>
        <Box sx={{ textAlign: "left", marginBottom: "1.5rem" }}>
          <Typography variant="subtitle1">
            {i18n.t("pages.connectionDetails.userinfo.issuedCredentials")}
          </Typography>
          <Typography variant="body2">{credentials.length}</Typography>
        </Box>
        <Button
          color="error"
          variant="contained"
          disableElevation
          disableRipple
          startIcon={<DeleteOutline />}
          onClick={() => setOpenModal(true)}
        >
          {i18n.t("pages.connectionDetails.userinfo.button.delete")}
        </Button>
      </Box>
      <PopupModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={i18n.t("pages.connectionDetails.userinfo.confirm.title")}
        description={i18n.t("pages.connectionDetails.userinfo.confirm.body")}
        footer={
          <>
            <Button
              variant="contained"
              aria-label="cancel delete connection"
              onClick={() => setOpenModal(false)}
              className="neutral-button"
            >
              {i18n.t("pages.connectionDetails.userinfo.confirm.cancel")}
            </Button>
            <Button
              variant="contained"
              aria-label="confirm delete connection"
              onClick={handleDeleteContact}
            >
              {i18n.t("pages.connectionDetails.userinfo.confirm.confirm")}
            </Button>
          </>
        }
      />
    </>
  );
};

export { ConnectionContactCard };
