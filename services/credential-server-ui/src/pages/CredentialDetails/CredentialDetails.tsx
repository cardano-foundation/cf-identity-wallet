import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { Box, Button } from "@mui/material";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { RoleIndex } from "../../components/NavBar/constants/roles";
import { PageHeader } from "../../components/PageHeader";
import { CredentialMap } from "../../const";
import { i18n } from "../../i18n";
import { useAppSelector } from "../../store/hooks";
import { getRoleView } from "../../store/reducers";
import { CredentialInfoCard } from "./CredentialInfoCard";
import { CredentialTable } from "./CredentialsTable";
import "./CredentialDetails.scss";

export const CredentialDetails = () => {
  const roleViewIndex = useAppSelector(getRoleView) as RoleIndex;
  const credentials = useAppSelector((state) => state.connections.credentials);
  const nav = useNavigate();
  const { id } = useParams();

  const schema = CredentialMap[String(id)] || "";

  const displayCredentials = useMemo(
    () => credentials.filter((item) => item.schema.$id === id),
    [credentials, id]
  );

  return (
    <Box className="credential-detail-page">
      <PageHeader
        onBack={() => nav(-1)}
        title={`${i18n.t("pages.credentialDetail.title")}`}
        action={
          roleViewIndex === 0 && (
            <Button
              variant="contained"
              disableElevation
              disableRipple
              startIcon={<AddCircleOutlineOutlinedIcon />}
            >
              {i18n.t("pages.credentialDetail.issue")}
            </Button>
          )
        }
      />
      <Box className="credential-detail-page-container">
        <CredentialInfoCard
          schemaName={schema}
          creationDate={new Date()}
        />
        <CredentialTable credentials={displayCredentials} />
      </Box>
    </Box>
  );
};
