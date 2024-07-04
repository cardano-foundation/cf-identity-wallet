import React from "react";
import GetQRButton from "../components/GetQRButton";
import { config } from "../config";
import { Divider, Grid, Typography } from "@mui/material";
import GetInputButton from "../components/inputOOBI/GetInputButton";
import GetScannerButton from "../components/inputOOBI/GetScannerButton";

const ConnectionPage: React.FC = () => {
  return (
    <>
      <Typography component="h1" variant="h4" align="center">
        Connection
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={12}>
          <Divider />
          <GetQRButton
            name=""
            url={`${config.endpoint}${config.path.keriOobi}`}
            onQRGenerated={() => {}}
          />
          <Divider />
          <GetScannerButton />
          <Divider />
          <GetInputButton />
          <Divider />
        </Grid>
      </Grid>
    </>
  );
};

export default ConnectionPage;
