import React, { ReactNode, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { CopyAll } from "@mui/icons-material";
import axios from "axios";
import QRCode from "qrcode.react";

interface ConnectionQRProps {
  name: string;
  url: string;
  customCredentialForm?: ReactNode;
  jsonFilePath?: string;
  icon?: ReactNode;
  onNextStep?: () => void;
}

const ConnectionQR: React.FC<ConnectionQRProps> = ({
  name,
  url,
  customCredentialForm,
  jsonFilePath,
  icon,
  onNextStep,
}) => {
  const [responseLink, setResponseLink] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [customCredential, setCustomCredential] = useState("");

  const [showCircularProgress, setShowCircularProgress] = useState(false);
  const [showCustomCredential, setShowCustomCredential] = useState(false);
  const [errorOnRequest, setErrorOnRequest] = useState(false);

  useEffect(() => {
    handleShowQr();
  }, []);

  const handleShowQr = async () => {
    try {
      setShowQR(false);
      setShowCircularProgress(true);
      setErrorOnRequest(false);

      let response;

      try {
        if (customCredentialForm) {
          if (customCredential) {
            response = await axios.post(url, customCredential);
            setShowCustomCredential(true);
          } else {
            setShowCircularProgress(false);
            setShowQR(false);
            return;
          }
        } else if (jsonFilePath) {
          response = await axios.post(
            url,
            await fetch(jsonFilePath).then((response) => response.json()),
          );
          setResponseLink(await response.data.data);
        } else {
          response = await axios(url);
          setResponseLink(await response.data.data);
        }

        setResponseLink(await response.data.data);
        console.log(name, response.data.data);
      } catch (e) {
        console.log(e);
        setShowCircularProgress(false);
        setErrorOnRequest(true);
        return;
      }

      setShowCircularProgress(false);
      setShowQR(true);
    } catch (error) {
      console.error("Error while trying to connect to the server.", error);
    }
  };

  return (
    <Container sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        {icon}
        {name}
      </Typography>
      <Typography align="center">
        To connect, scan this QR code with the scanner of your identity wallet. If you wish to receive credentials to a group identifier, each member or device in the group should individually scan this QR code.
      </Typography>
      {customCredentialForm &&
        React.cloneElement(customCredentialForm as React.ReactElement<any>, {
          onCustomCredentialChange: setCustomCredential,
        })}

      {showCircularProgress && (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )}
      {showQR && (
        <div>
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <QRCode value={responseLink} size={256} />
          </Box>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={() => navigator.clipboard.writeText(responseLink)}>Copy connection URL<CopyAll /></Button>
          </div>
        </div>
      )}
      {showCustomCredential && (
        <TextField
          id="outlined-multiline-static"
          label="Credential JSON"
          multiline
          rows={JSON.stringify(customCredential, null, 2).split("\n").length}
          fullWidth
          value={JSON.stringify(customCredential, null, 2)}
        />
      )}
      {errorOnRequest && (
        <Alert severity="error">
          It was not possible to connect to the server. Try again
        </Alert>
      )}
      {onNextStep &&
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="contained" color="primary" onClick={() => onNextStep()}>
            Next step
          </Button>
        </Box>
      }

    </Container>
  );
};

export default ConnectionQR;
