import { Box, Typography } from "@mui/material";
import { ReviewProps } from "./RequestPresentationModal.types";
import CredentialBG from "../../assets/credential-bg.svg";
import { CredentialTypeAttributes } from "../../const";
import { i18n } from "../../i18n";

const Review = ({
  credentialType,
  connectionId,
  connections,
  attribute,
}: ReviewProps) => {
  if (!credentialType || !connectionId) return null;

  const credAttributes = CredentialTypeAttributes[credentialType];
  const connectionName = connections.find(
    (item) => item.id === connectionId
  )?.alias;

  return (
    <Box className="review-stage">
      <Box sx={{ textAlign: "left", marginBottom: "1.5rem" }}>
        <Typography variant="subtitle1">
          {i18n.t("pages.credentialDetails.issueCredential.review.credential")}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            marginBottom: "1.5rem",
          }}
        >
          <img
            width={36}
            src={CredentialBG}
            alt="schema-name"
          />
          <Typography
            className="content"
            variant="body2"
          >
            {credentialType}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ textAlign: "left", marginBottom: "1.5rem" }}>
        <Typography variant="subtitle1">
          {i18n.t("pages.credentialDetails.issueCredential.review.issueTo")}
        </Typography>
        <Typography
          className="content"
          variant="body2"
        >
          {connectionName}
        </Typography>
      </Box>
      {credAttributes.map((credAttribute) => (
        <Box sx={{ textAlign: "left" }}>
          <Typography variant="subtitle1">
            {i18n.t(
              `pages.credentialDetails.issueCredential.inputAttribute.label.${credAttribute.label.toLowerCase()}`
            )}
          </Typography>
          <Typography
            className="content"
            variant="body2"
          >
            {attribute[credAttribute.key]}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export { Review };
