import { useEffect, useState } from "react";
import { IonCol, IonGrid, IonIcon, IonPage, IonRow } from "@ionic/react";
import {
  checkmark,
  personCircleOutline,
  swapHorizontalOutline,
} from "ionicons/icons";
import i18next from "i18next";
import { PageLayout } from "../../components/layout/PageLayout";
import { i18n } from "../../../i18n";
import "./ConnectionRequest.scss";
import {
  getConnectionRequest,
  setConnectionRequest,
} from "../../../store/reducers/stateCache";
import { AriesAgent } from "../../../core/agent/agent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { connectionType } from "../../constants/dictionary";
import { Alert } from "../../components/Alert";
import { TOAST_MESSAGE_DELAY } from "../../../constants/appConstants";
import { ConnectionDetails } from "../../../core/agent/agent.types";
import { ConnectionRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import CardanoLogo from "../../../ui/assets/images/CardanoLogo.jpg";

const ConnectionRequest = () => {
  const dispatch = useAppDispatch();
  const connectionRequest = useAppSelector(getConnectionRequest);
  const [showConnectionRequest, setShowConnectionRequest] = useState(false);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [connectionData, setConnectionData] = useState<ConnectionDetails>();
  const [connectionRequestType, setConnectionRequestType] = useState("");

  useEffect(() => {
    async function handle() {
      if (connectionRequest.id.length > 0) {
        // @TODO - foconnor: This call also gets the OOBI - double check if we need the OOBI here - if not, split into 2 functions
        const agentData = await AriesAgent.agent.connections.getConnectionById(
          connectionRequest.id
        );
        setConnectionData(agentData);
        if (
          connectionRequest.type ===
            ConnectionRequestType.CONNECTION_INCOMING ||
          connectionRequest.type === ConnectionRequestType.CONNECTION_RESPONSE
        ) {
          setConnectionRequestType(connectionType.connection);
        } else if (connectionRequest.type === ConnectionRequestType.ISSUE_VC) {
          setConnectionRequestType(connectionType.credential);
        }
        setShowConnectionRequest(true);
      }
    }
    void handle();
  }, [connectionRequest.id]);

  const handleReset = () => {
    dispatch(setConnectionRequest({ id: "" }));
    setShowConnectionRequest(false);
    setInitiateAnimation(false);
  };

  const handleConnect = async () => {
    setInitiateAnimation(true);
    if (connectionRequest.type === ConnectionRequestType.CONNECTION_INCOMING) {
      AriesAgent.agent.connections.acceptRequestConnection(
        connectionRequest.id
      );
    } else if (
      connectionRequest.type === ConnectionRequestType.CONNECTION_RESPONSE
    ) {
      AriesAgent.agent.connections.acceptResponseConnection(
        connectionRequest.id
      );
    }
    setTimeout(() => {
      handleReset();
    }, TOAST_MESSAGE_DELAY);
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
                src={connectionData?.logo ?? CardanoLogo}
                alt="connection-request-provider-logo"
              />
            </div>
          </IonRow>
          <IonRow className="connection-request-info-row">
            <IonCol size="12">
              <span>
                {connectionRequestType + i18n.t("connectionrequest.request")}
              </span>
              <strong>{connectionData?.label}</strong>
            </IonCol>
          </IonRow>
          <IonRow className="connection-request-status">
            <IonCol size="12">
              <strong>
                {connectionRequest.type ===
                ConnectionRequestType.CONNECTION_INCOMING
                  ? i18next.t("connectionrequest.pending", {
                      action: connectionRequestType,
                    })
                  : i18next.t("connectionrequest.success", {
                      action: connectionRequestType,
                    })}
              </strong>
            </IonCol>
          </IonRow>
        </IonGrid>
      </PageLayout>
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-confirm"
        headerText={i18next.t("connectionrequest.alert.title", {
          initiator: connectionData?.label,
        })}
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
