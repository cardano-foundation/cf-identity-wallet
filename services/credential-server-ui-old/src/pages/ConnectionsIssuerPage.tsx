import React from "react";
import ConnectionQR from "../components/ConnectionQR";
import { config } from "../config";
import { Typography } from "@mui/material";
import PowerIcon from "@mui/icons-material/Power";

const ConnectionsIssuer: React.FC = () => {
  return (
    <>
      <Typography
        component="h1"
        variant="h4"
        align="center"
      >
        {`Holder <--> Issuer`}
      </Typography>
      <ConnectionQR
        icon={<PowerIcon />}
        name="Create a connection"
        url={`${config.endpoint}${config.path.invitation}`}
      />
    </>
  );
};

export default ConnectionsIssuer;
