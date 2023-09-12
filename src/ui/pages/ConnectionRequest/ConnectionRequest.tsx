import { useEffect, useState } from "react";
import { IonCol, IonGrid, IonIcon, IonPage, IonRow } from "@ionic/react";
import {
  personCircleOutline,
  swapHorizontalOutline,
  checkmark,
} from "ionicons/icons";
import { PageLayout } from "../../components/layout/PageLayout";
import { i18n } from "../../../i18n";
import "./ConnectionRequest.scss";
import {
  getConnectionRequest,
  setConnectionRequest,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { AriesAgent } from "../../../core/aries/ariesAgent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import CardanoLogo from "../../assets/images/CardanoLogo.jpg";
import { toastState } from "../../constants/dictionary";
import { Alert } from "../../components/Alert";

const ConnectionRequest = () => {
  const dispatch = useAppDispatch();
  const connectionRequest = useAppSelector(getConnectionRequest);
  const [showConnectionRequest, setShowConnectionRequest] = useState(false);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  useEffect(() => {
    setShowConnectionRequest(!!connectionRequest.length);
  }, [connectionRequest]);

  const handleReset = () => {
    dispatch(setConnectionRequest(""));
    setShowConnectionRequest(false);
    setInitiateAnimation(false);
  };

  const handleConnect = async () => {
    setInitiateAnimation(true);
    // await AriesAgent.agent.receiveInvitationFromUrl(connectionRequest);
    setTimeout(() => {
      handleReset();
      // @TODO - sdisalvo: show this toast when "state": "request-sent"
      dispatch(setCurrentOperation(toastState.connectionRequestPending));
    }, 4000);
  };

  return (
    <IonPage
      className={`page-layout connection-request safe-area ${
        showConnectionRequest ? "show" : "hide"
      } ${initiateAnimation ? "animation-on" : "animation-off"}`}
      data-testid="connection-request"
    >
      <PageLayout
        footer={true}
        primaryButtonText={`${i18n.t("connectionrequest.button.connect")}`}
        primaryButtonAction={() => setAlertIsOpen(true)}
        secondaryButtonText={`${i18n.t("connectionrequest.button.cancel")}`}
        secondaryButtonAction={() => handleReset()}
      >
        <h2>{i18n.t("connectionrequest.title")}</h2>
        <IonGrid className="connection-request-content">
          <IonRow className="connection-request-icons-row">
            <div className="connection-request-user-logo">
              <IonIcon
                icon={personCircleOutline}
                color="light"
              />
            </div>
            <div className="connection-request-swap-logo">
              <span>
                <IonIcon icon={swapHorizontalOutline} />
              </span>
            </div>
            <div className="connection-request-checkmark-logo">
              <span>
                <IonIcon icon={checkmark} />
              </span>
            </div>
            <div className="connection-request-provider-logo">
              <img
                src={CardanoLogo}
                alt="connection-request-provider-logo"
              />
            </div>
          </IonRow>
          <IonRow className="connection-request-info-row">
            <IonCol size="12">
              <span>Connection request from</span>
              <strong>Passport Office</strong>
            </IonCol>
          </IonRow>
          <IonRow className="connection-request-status">
            <IonCol size="12">
              <strong>{i18n.t("connectionrequest.success")}</strong>
            </IonCol>
          </IonRow>
        </IonGrid>
      </PageLayout>
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-confirm"
        headerText={i18n.t("connectionrequest.alert.title")}
        confirmButtonText={`${i18n.t("connectionrequest.alert.confirm")}`}
        cancelButtonText={`${i18n.t("connectionrequest.alert.cancel")}`}
        actionConfirm={handleConnect}
        actionCancel={handleReset}
        actionDismiss={handleReset}
      />
    </IonPage>
  );
};

export { ConnectionRequest };
