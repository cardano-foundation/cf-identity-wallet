import { Button } from "@mui/material";

import {
  ContentCopy,
  CheckCircleOutlined,
  RefreshOutlined,
  ArrowBack,
} from "@mui/icons-material";
import { i18n } from "../../../../../../i18n";
import { ModalFooterProps } from "./ModalFooter.types";

const ModalFooter = ({
  currentStage,
  errorOnRequest,
  oobi,
  copied,
  isInputValid,
  handleShowQr,
  handleCopyLink,
  handleNext,
  handleBack,
  handleComplete,
}: ModalFooterProps) => {
  return (
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
              disabled={!oobi || copied}
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
            disabled={!oobi || errorOnRequest}
            onClick={handleNext}
          >
            {i18n.t("pages.connections.addConnection.modal.button.next")}
          </Button>
        </>
      )}
      {currentStage === 2 && (
        <>
          <Button
            variant="contained"
            className="neutral-button back-button"
            onClick={handleBack}
          >
            <ArrowBack />
            {i18n.t("pages.connections.addConnection.modal.button.back")}
          </Button>
          <Button
            variant="contained"
            className="primary-button"
            onClick={handleComplete}
            disabled={!isInputValid}
          >
            {i18n.t("pages.connections.addConnection.modal.button.complete")}
          </Button>
        </>
      )}
    </>
  );
};

export { ModalFooter };
