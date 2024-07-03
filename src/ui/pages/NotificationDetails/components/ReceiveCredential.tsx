import { IonCol, IonIcon } from "@ionic/react";
import {
  checkmark,
  personCircleOutline,
  swapHorizontalOutline,
} from "ionicons/icons";
import i18next from "i18next";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import "./ReceiveCredential.scss";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { ResponsivePageLayout } from "../../../components/layout/ResponsivePageLayout";
import { i18n } from "../../../../i18n";
import { Alert as AlertDecline } from "../../../components/Alert";
import { PageFooter } from "../../../components/PageFooter";
import { useAppIonRouter, useIonHardwareBackButton } from "../../../hooks";
import { BackEventPriorityType, RequestType } from "../../../globals/types";
import { KeriaNotification } from "../../../../core/agent/agent.types";
import { DataProps } from "../../../../routes/nextRoute/nextRoute.types";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { getStateCache } from "../../../../store/reducers/stateCache";
import { getBackRoute } from "../../../../routes/backRoute";
import { RoutePath } from "../../../../routes";
import { updateReduxState } from "../../../../store/utils";
import { PageHeader } from "../../../components/PageHeader";
import { getConnectionsCache } from "../../../../store/reducers/connectionsCache";
import { Agent } from "../../../../core/agent/agent";

const ReceiveCredential = ({
  notificationDetails,
  handleBack,
}: {
  notificationDetails: KeriaNotification;
  handleBack: () => void;
}) => {
  const pageId = "notification-details";
  const connectionsCache = useAppSelector(getConnectionsCache);
  const fallbackLogo = KeriLogo;
  const [activeStatus, setActiveStatus] = useState(true);
  const [alertDeclineIsOpen, setAlertDeclineIsOpen] = useState(false);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const ANIMATION_DELAY = 4000;
  const [blur, setBlur] = useState(false);
  const connection = connectionsCache.filter(
    (connection) => connection.id === notificationDetails.connectionId
  )[0]?.label;

  useIonHardwareBackButton(
    BackEventPriorityType.Page,
    handleBack,
    !activeStatus
  );

  const handleAccept = async () => {
    setInitiateAnimation(true);

    Agent.agent.ipexCommunications.acceptAcdc(notificationDetails.id);
    setTimeout(() => {
      handleBack();
    }, ANIMATION_DELAY);
  };

  return (
    <>
      <ResponsivePageLayout
        pageId={`${pageId}-receive-credential`}
        customClass={`${pageId}-receive-credential${
          initiateAnimation ? " animation-on" : " animation-off"
        }`}
        activeStatus={activeStatus}
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={handleBack}
            closeButtonLabel={`${i18n.t(
              "notifications.details.buttons.close"
            )}`}
            title={`${i18n.t(
              "notifications.details.credential.receive.title"
            )}`}
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
            <div className="request-swap-logo">
              <span>
                <IonIcon icon={swapHorizontalOutline} />
              </span>
            </div>
            <div className="request-checkmark-logo">
              <span>
                <IonIcon icon={checkmark} />
              </span>
            </div>
            <div className="request-provider-logo">
              <img
                data-testid="credential-request-provider-logo"
                src={fallbackLogo}
                alt="request-provider-logo"
              />
            </div>
          </div>
          <div className="request-info-row">
            <IonCol size="12">
              <span>
                {i18n.t("notifications.details.credential.receive.receivefrom")}
              </span>
              <strong>{connection}</strong>
            </IonCol>
          </div>
        </div>
        <PageFooter
          pageId={pageId}
          primaryButtonText={`${i18n.t(
            "notifications.details.buttons.accept"
          )}`}
          primaryButtonAction={handleAccept}
          secondaryButtonText={`${i18n.t(
            "notifications.details.buttons.decline"
          )}`}
          secondaryButtonAction={handleBack}
        />
      </ResponsivePageLayout>
      <AlertDecline
        isOpen={alertDeclineIsOpen}
        setIsOpen={setAlertDeclineIsOpen}
        dataTestId="multisig-request-alert-decline"
        headerText={i18n.t(
          "notifications.details.identifier.alert.textdecline"
        )}
        confirmButtonText={`${i18n.t("notifications.details.buttons.decline")}`}
        cancelButtonText={`${i18n.t("notifications.details.buttons.cancel")}`}
        actionConfirm={() => handleAccept()}
        actionCancel={() => setAlertDeclineIsOpen(false)}
        actionDismiss={() => setAlertDeclineIsOpen(false)}
      />
    </>
  );
};

export { ReceiveCredential };
