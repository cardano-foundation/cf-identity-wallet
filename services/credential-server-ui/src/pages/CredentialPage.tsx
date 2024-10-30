import React from "react";
import { CredentialForm } from "../components/CredentialForm";
import axios from "axios";
import { config } from "../config";
import { Typography } from "@mui/material";

const CredentialPage: React.FC = () => {
  const handleIssueCredential = async (data: any) => {
    await axios.post(
      `${config.endpoint}${config.path.issueAcdcCredential}`,
      data
    );
  };

  return (
    <div>
      <Typography
        component="h1"
        variant="h4"
        align="center"
      >
        Issue Credential
      </Typography>
      <CredentialForm
        onSubmit={handleIssueCredential}
        submitButtonText="Issue Credential"
        successMessage="Issue credential successfully"
        apiPath={config.path.issueAcdcCredential}
      />
    </div>
  );
};

export { CredentialPage };
