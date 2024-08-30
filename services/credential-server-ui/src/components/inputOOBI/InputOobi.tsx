import React, { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Container, Grid, TextField, Typography } from "@mui/material";
import { resolveOobi } from "../../services/resolve-oobi";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./qrscanner.css";

interface InputOobiProps {
  handleGetContacts: Function;
  backToFirstStep: () => void;
}

enum ContentType {
  SCANNER = "scanner",
  RESOLVING = "resolving",
  RESOLVED = "resolved",
}

const InputOobi: React.FC<InputOobiProps> = ({ handleGetContacts, backToFirstStep }) => {
  const [oobi, setOobi] = useState("");
  const [isAtendeeOobiEmptyVisible, setIsAtendeeOobiEmptyVisible] =
    useState(false);
  const [restartCamera, setRestartCamera] = useState(false);
  const [contentType, setContentType] = useState<ContentType>(
    ContentType.SCANNER,
  );
  const [canReset, setCanReset] = useState(false);
  const [showInput, setShowInput] = useState(false);
  let isCameraRendered = false;

  const elementRef = useRef(null);
  useEffect(() => {
    if (elementRef.current && !isCameraRendered && showInput) {
      isCameraRendered = true;
      const scanner = new Html5QrcodeScanner(
        "reader",
        {
          qrbox: {
            width: 1024,
            height: 1024,
          },
          fps: 5,
        },
        false,
      );

      const success = (result: string) => {
        scanner.clear();
        handleResolveOObi(result);
      };
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const error = (_: any) => { };
      scanner.render(success, error);
    }
  }, [restartCamera, elementRef.current, showInput]);

  const handleSubmit = async () => {
    if (oobi === "" || !oobi.includes("oobi")) {
      setIsAtendeeOobiEmptyVisible(true);
      return;
    } else {
      setIsAtendeeOobiEmptyVisible(false);
    }
    await resolveOobi(oobi);
    setContentType(ContentType.RESOLVED);
    setCanReset(true);
    await handleGetContacts();
  };

  const restartScanner = async () => {
    isCameraRendered = false;
    setShowInput(false);
    setRestartCamera(!restartCamera);
    setContentType(ContentType.SCANNER);
  };

  const handleResolveOObi = async (oobi: string) => {
    if (!(oobi.length && oobi.includes("oobi"))) {
      return restartScanner();
    }

    setContentType(ContentType.RESOLVING);
    await resolveOobi(oobi);
    setContentType(ContentType.RESOLVED);
    setCanReset(true);
    await handleGetContacts();
  };

  const renderContent = () => {
    switch (contentType) {
      case ContentType.SCANNER:
        return {
          component: <div ref={elementRef} id="reader" />,
          title: "Scan your wallet QR Code",
        };
      case ContentType.RESOLVING:
        return {
          component: <></>,
          title: "Resolving wallet connection",
        };
      case ContentType.RESOLVED:
        return {
          component: (
            <></>
          ),
          title: "Connected successfully",
        };
    }
  };
  const content = renderContent();

  const handleReset = () => {
    setCanReset(false);
    restartScanner();
  }

  return (
    <Container sx={{ py: 2 }}>
      <Typography align="center" mb={2}>
        Now, to connect the server to your identity wallet, please share an identifier connection QR code. This can be accessed directly in the identifier itself (share button), or in the Connections page by clicking the + icon and “Provide a QR Code"
      </Typography>
      <div className="scannerPage">
        <div>
          <h3 className="">{content?.title}</h3>
          {!showInput &&
            <Box sx={{ display: "flex", justifyContent: "center" }} mb={2}>
              <Button
                sx={{ minHeight: '200px', minWidth: '230px', color: "gray", borderColor: "gray" }}
                variant="outlined"
                onClick={() => setShowInput(true)}
              >
                Start Scanner
              </Button>
            </Box>}
          {showInput && (<>
            {content?.component}
          </>)}
        </div>
      </div>

      {!canReset && <Grid container xs={12} justifyContent={"center"}>
        <Grid item xs={12} md={6} mb={2} sx={{ my: 2 }}>
          <TextField
            required
            id="input-oobi"
            label="Input connection link manually instead..."
            variant="outlined"
            fullWidth
            onChange={(e) => setOobi(e.target.value)}
          />
          {isAtendeeOobiEmptyVisible && (
            <Alert severity="error">Please, input valid OOBI link</Alert>
          )}
        </Grid>
      </Grid>}

      <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          onClick={() => backToFirstStep()}
          sx={{ mx: { xs: 1, md: 1 } }}
        >
          Back
        </Button>
        {
          canReset ? <Button
            variant="contained"
            color="primary"
            onClick={() => handleReset()}
            sx={{ mx: { xs: 1, md: 1 } }}
          >
            Reset
          </Button> : <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mx: { xs: 1, md: 1 } }}
          >
            Submit
          </Button>
        }
      </Grid>
    </Container>
  );
};

export { InputOobi };
