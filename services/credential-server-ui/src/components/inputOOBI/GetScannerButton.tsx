import React, { useEffect, useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./qrscanner.css";
import { resolveOobi } from "../../services/resolve-oobi";

interface GetScannerButtonProps {
  onBack: () => void;
}
enum ContentType {
  SCANNER = "scanner",
  RESOLVING = "resolving",
  RESOLVED = "resolved",
}
const GetScannerButton: React.FC<GetScannerButtonProps> = ({ onBack }) => {
  const [showInput, setShowInput] = useState(false);
  const [restartCamera, setRestartCamera] = useState(false);
  const [contentType, setContentType] = useState<ContentType>(
    ContentType.SCANNER,
  );
  const [showScannerBtn, setshowScannerBtn] = useState(true);

  useEffect(() => {
    if (showInput) {
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
      setshowScannerBtn(false);
    }
  }, [restartCamera, showInput]);

  const restartScanner = async () => {
    setRestartCamera(!restartCamera);
    setContentType(ContentType.SCANNER);
  };

  const renderContent = () => {
    switch (contentType) {
      case ContentType.SCANNER:
        return {
          component: <div id="reader" />,
          title: "Scan your wallet QR Code",
        };
      case ContentType.RESOLVING:
        return {
          component: <></>,
          title: "Resolving wallet OOBI",
        };
      case ContentType.RESOLVED:
        return {
          component: (
            <button className="resolve-button" onClick={() => restartScanner()}>
              Close
            </button>
          ),
          title: "The wallet OOBI was resolved successfully",
        };
    }
  };
  const handleResolveOObi = async (oobi: string) => {
    if (!(oobi.length && oobi.includes("oobi"))) {
      return restartScanner();
    }

    setContentType(ContentType.RESOLVING);
    await resolveOobi(oobi);
    setContentType(ContentType.RESOLVED);
  };

  const content = renderContent();

  return (
    <Container sx={{ py: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "left" }} mb={1}>
        <Button
          variant="text"
          onClick={() => onBack()}
        >
          Back
        </Button>
      </Box>
      <Typography align="center" mb={2}>
        Now, to connect the server to your identity wallet, please share an identifier connection QR code. This can be accessed directly in the identifier itself (share button), or in the Connections page by clicking the + icon and “Provide a QR Code"
      </Typography>
      {showScannerBtn &&
        <Box sx={{ display: "flex", justifyContent: "center" }} mb={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowInput(true)}
          >
            Show scanner
          </Button>
        </Box>
      }
      {showInput && (
        <>
          <div className="scannerPage">
            <div>
              <h3 className="">{content?.title}</h3>
              {content?.component}
            </div>
          </div>
        </>
      )}
    </Container>
  );
};

export default GetScannerButton;
