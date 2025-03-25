import { Box, Typography } from "@mui/material";
import CredentialBG from "../../assets/credential-bg.svg";
import { i18n } from "../../i18n";
import { formatDate } from "../../utils/dateFormatter";
import { CredentialInfoCardProps } from "./CredentialDetail.types";

const CredentialInfoCard = ({
  schemaName,
  creationDate,
}: CredentialInfoCardProps) => {
  return (
    <Box
      sx={(theme) => ({
        padding: "1.5rem",
        borderRadius: "1rem",
        boxShadow:
          "0.25rem 0.25rem 1.25rem 0 rgba(var(--text-color-rgb), 0.16)",
        width: 300,
        height: "fit-content",
        backgroundColor: "var(--color-neutral-100)",
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
        <img
          width={80}
          src={CredentialBG}
          alt="schema-name"
        />
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "var(--color-neutral-800)",
          }}
        >
          {schemaName}
        </Typography>
      </Box>
      <Box sx={{ textAlign: "left", marginBottom: "1.5rem" }}>
        <Typography variant="subtitle1">
          {i18n.t("pages.credentialdetail.schemaInfo.creationDate")}
        </Typography>
        <Typography variant="body2">{formatDate(creationDate)}</Typography>
      </Box>
    </Box>
  );
};

export { CredentialInfoCard };
