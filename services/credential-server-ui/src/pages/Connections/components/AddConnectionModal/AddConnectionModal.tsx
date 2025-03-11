import { Trans } from "react-i18next";
import { useState, useEffect } from "react";
import axios from "axios";
import { PopupModal } from "../../../../components/PopupModal";
import { AddConnectionModalProps } from "./AddConnectionModal.types";
import { i18n } from "../../../../i18n";
import { Button, CircularProgress, Typography } from "@mui/material";
import {
  ContentCopy,
  QrCodeRounded,
  RefreshOutlined,
  WarningAmber,
  CheckCircleOutlined,
} from "@mui/icons-material";
import "./AddConnectionModal.scss";
import { QRCodeSVG } from "qrcode.react";
import { config } from "../../../../config";
import { useSnackbar, VariantType } from "notistack";

const AddConnectionModal = ({
  openModal,
  setOpenModal,
}: AddConnectionModalProps) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [responseLink, setResponseLink] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorOnRequest, setErrorOnRequest] = useState(false);
  const RESET_TIMEOUT = 1000;
  const { enqueueSnackbar } = useSnackbar();

  const triggerToast = (message: string, variant: VariantType) => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: { vertical: "top", horizontal: "center" },
    });
  };

  useEffect(() => {
    handleShowQr();
  }, []);

  useEffect(() => {
    setCopied(false);
  }, [currentStage]);

  const handleShowQr = async () => {
    const url = `${config.endpoint}${config.path.keriOobi}`;
    try {
      setShowQR(false);
      setLoading(true);
      setErrorOnRequest(false);
      setResponseLink("");

      try {
        const response = await axios(url);
        setResponseLink(response.data.data);
        setLoading(false);
        setShowQR(true);
      } catch (e) {
        console.error(e);
        setLoading(false);
        setErrorOnRequest(true);
      }
    } catch (error) {
      console.error("Error while trying to connect to the server.", error);
      setLoading(false);
      setErrorOnRequest(true);
    }
  };

  const handleCopyLink = () => {
    if (responseLink) {
      setCopied(true);
      navigator.clipboard.writeText(responseLink);
    }
  };

  const resetModal = () => {
    setOpenModal(false);
    setTimeout(() => {
      setCurrentStage(1);
      setErrorOnRequest(false);
      setCopied(false);
    }, RESET_TIMEOUT);
  };

  return (
    <PopupModal
      open={openModal}
      onClose={resetModal}
      title={i18n.t("pages.connections.addConnection.modal.title")}
      customClass={`add-connection-modal stage-${currentStage}`}
      description={
        <Trans
          i18nKey={
            currentStage === 1
              ? "pages.connections.addConnection.modal.descriptionStepOne"
              : "pages.connections.addConnection.modal.descriptionStepTwo"
          }
          components={{ bold: <strong /> }}
        />
      }
      footer={
        <>
          {currentStage === 1 && (
            <>
              {errorOnRequest ? (
                <Button
                  variant="contained"
                  className="secondary-button"
                  onClick={handleShowQr}
                >
                  {i18n.t("pages.connections.addConnection.modal.button.retry")}
                  <RefreshOutlined />
                </Button>
              ) : (
                <Button
                  variant="contained"
                  className="secondary-button"
                  disabled={!responseLink || copied}
                  onClick={handleCopyLink}
                >
                  {i18n.t(
                    copied
                      ? "pages.connections.addConnection.modal.button.copied"
                      : "pages.connections.addConnection.modal.button.copyConnectionId"
                  )}
                  {copied ? <CheckCircleOutlined /> : <ContentCopy />}
                </Button>
              )}
              <Button
                variant="contained"
                className="primary-button"
                disabled={!responseLink || errorOnRequest}
                onClick={() => setCurrentStage(2)}
              >
                {i18n.t("pages.connections.addConnection.modal.button.next")}
              </Button>
            </>
          )}
          {currentStage === 2 && (
            <>
              <Button
                variant="contained"
                className="neutral-button"
                onClick={() => setCurrentStage(1)}
              >
                {i18n.t("pages.connections.addConnection.modal.button.back")}
              </Button>
              <Button
                variant="contained"
                className="primary-button"
                onClick={resetModal}
              >
                {i18n.t(
                  "pages.connections.addConnection.modal.button.complete"
                )}
              </Button>
            </>
          )}
        </>
      }
    >
      {currentStage === 1 && (
        <div className="connection-qr">
          {loading && (
            <div className="connection-loading">
              <QrCodeRounded className="qr-code-icon" />
              <CircularProgress className="loading-spinner" />
            </div>
          )}
          {showQR && (
            <QRCodeSVG
              value={responseLink}
              size={280}
            />
          )}
          {errorOnRequest && (
            <div className="error-on-request">
              <WarningAmber />
              <Typography>
                {i18n.t("pages.connections.addConnection.modal.errorOnRequest")}
              </Typography>
            </div>
          )}
        </div>
      )}
      {currentStage === 2 && <div>{/* Content for stage 2 */}</div>}
    </PopupModal>
  );
};

export { AddConnectionModal };
