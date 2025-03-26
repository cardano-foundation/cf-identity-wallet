import { Box, Typography } from "@mui/material";
import CredentialBG from "../../assets/credential-bg.svg";
import { i18n } from "../../i18n";
import { formatDate } from "../../utils/dateFormatter";
import { CredentialInfoCardProps } from "./CredentialDetails.types";

const CredentialInfoCard = ({
  schemaName,
  creationDate,
}: CredentialInfoCardProps) => {
  return (
    <Box className="info-card">
      <Box className="info-card-header">
        <img
          width={80}
          src={CredentialBG}
          alt="schema-name"
        />
        <Typography className="header-name">{schemaName}</Typography>
      </Box>
      <Box className="attribute">
        <Typography variant="subtitle1">
          {i18n.t("pages.credentialDetails.schemaInfo.creationDate")}
        </Typography>
        <Typography variant="body2">{formatDate(creationDate)}</Typography>
      </Box>
    </Box>
  );
};

export { CredentialInfoCard };
