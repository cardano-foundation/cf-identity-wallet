import React from "react";
import { CredentialForm } from "../components/CredentialForm";
import axios from "axios";
import { config } from "../config";
import { Typography } from "@mui/material";

const RequestCredential: React.FC = () => {
  const handleRequestCredential = async (data: any) => {
    await axios.post(
      `${config.endpoint}${config.path.requestDisclosure}`,
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
        Request Credential
      </Typography>
      <CredentialForm
        onSubmit={handleRequestCredential}
        submitButtonText="Request Credential"
        successMessage="Request credential successfully sent"
        apiPath={config.path.requestDisclosure}
      />
    </div>
  );
};

export { RequestCredential };
