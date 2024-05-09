import { IonIcon } from "@ionic/react";
import { checkmark, personCircleOutline } from "ionicons/icons";
import { i18n } from "../../../../../i18n";
import { PageFooter } from "../../../../components/PageFooter";
import { PageHeader } from "../../../../components/PageHeader";
import { ResponsivePageLayout } from "../../../../components/layout/ResponsivePageLayout";
import { RequestProps } from "../../IncomingRequest.types";
import "./WalletConnectRequest.scss";
import { combineClassNames } from "../../../../utils/style";
import { useState } from "react";
import { Alert } from "../../../../components/Alert";

const WalletConnectRequestStageOne = ({
  pageId,
  activeStatus,
  requestData,
  handleCancel,
  setRequestStage,
}: RequestProps) => {
  const [openDeclineAlert, setOpenDeclineAlert] = useState(false);
  const [acceptAnimation, setAcceptAnimation] = useState(false);

  const classes = combineClassNames("wallet-connect-stage-one", {
    show: !!activeStatus,
    hide: !activeStatus,
    "animation-on": acceptAnimation,
    "animation-off": !acceptAnimation,
  });

  const openDecline = () => {
    setOpenDeclineAlert(true);
  };

  const handleClose = () => {
    handleCancel();
  };

  const handleAccept = () => {
    setAcceptAnimation(true);

    setTimeout(() => {
      setRequestStage?.(1);
    }, 250);
  };

  return (
    <>
      <ResponsivePageLayout
        pageId={`${pageId}`}
        activeStatus={activeStatus}
        customClass={classes}
        header={
          <PageHeader
            title={`${i18n.t("request.walletconnection.stageone.title")}`}
            closeButton
            closeButtonLabel={`${i18n.t(
              "request.walletconnection.stageone.back"
            )}`}
            closeButtonAction={openDecline}
          />
        }
      >
        <div className="request-animation-center">
          <div className="request-icons-row">
            <div className="request-user-logo">
              <IonIcon
                icon={personCircleOutline}
                color="light"
              />
            </div>
            <div className="request-checkmark-logo">
              <span>
                <IonIcon icon={checkmark} />
              </span>
            </div>
          </div>
          <p
            data-testid="wallet-connect-message"
            className="wallet-connect-message"
          >
            {i18n.t("request.walletconnection.stageone.message")}
          </p>
        </div>
        <PageFooter
          pageId={pageId}
          primaryButtonText={`${i18n.t("request.button.accept")}`}
          primaryButtonAction={handleAccept}
          secondaryButtonText={`${i18n.t("request.button.decline")}`}
          secondaryButtonAction={openDecline}
        />
      </ResponsivePageLayout>
      <Alert
        isOpen={openDeclineAlert}
        setIsOpen={setOpenDeclineAlert}
        dataTestId="alert-decline-connect"
        headerText={i18n.t(
          "request.walletconnection.stageone.alert.titleconfirm"
        )}
        confirmButtonText={`${i18n.t(
          "request.walletconnection.stageone.alert.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "request.walletconnection.stageone.alert.cancel"
        )}`}
        actionConfirm={handleClose}
        actionCancel={() => setOpenDeclineAlert(false)}
        actionDismiss={() => setOpenDeclineAlert(false)}
      />
    </>
  );
};

export { WalletConnectRequestStageOne };
