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
  getConnectionCredentialRequest,
  setConnectionCredentialRequest,
} from "../../../store/reducers/stateCache";
import { AriesAgent } from "../../../core/agent/agent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { connectionType } from "../../constants/dictionary";
import { Alert } from "../../components/Alert";
import { TOAST_MESSAGE_DELAY } from "../../../constants/appConstants";
import { ConnectionCredentialRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import CardanoLogo from "../../../ui/assets/images/CardanoLogo.jpg";

const ConnectionCredentialRequest = () => {
  const dispatch = useAppDispatch();
  const connectionCredentialRequest = useAppSelector(
    getConnectionCredentialRequest
  );
  const [showRequest, setShowRequest] = useState(false);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [requestData, setRequestData] = useState<{
    label: string;
    logo?: string;
  }>();
  const [requestType, setRequestType] = useState("");

  useEffect(() => {
    async function handle() {
      if (connectionCredentialRequest.id.length > 0) {
        if (
          connectionCredentialRequest.type ===
            ConnectionCredentialRequestType.CONNECTION_INCOMING ||
          connectionCredentialRequest.type ===
            ConnectionCredentialRequestType.CONNECTION_RESPONSE
        ) {
          const agentData =
            await AriesAgent.agent.connections.getConnectionShortDetailById(
              connectionCredentialRequest.id
            );
          setRequestData({ label: agentData.label, logo: agentData.logo });
          setRequestType(connectionType.connection);
          // Preview credential
          // await AriesAgent.agent.credentials.getPreviewCredential(credentialRecord);
        } else if (
          connectionCredentialRequest.type ===
          ConnectionCredentialRequestType.CREDENTIAL_OFFER_RECEIVED
        ) {
          const credentialRecord =
            await AriesAgent.agent.credentials.getCredentialRecordById(
              connectionCredentialRequest.id
            );
          if (credentialRecord.connectionId) {
            const agentData =
              await AriesAgent.agent.connections.getConnectionShortDetailById(
                credentialRecord.connectionId
              );
            setRequestData({ label: agentData.label, logo: agentData.logo });
          } else {
            // @TODO: handle case when connectionId is not present
            setRequestData({ label: "W3C" });
          }
          setRequestType(connectionType.credential);
        }
        setShowRequest(true);
      }
    }
    void handle();
  }, [connectionCredentialRequest.id]);

  const handleReset = () => {
    dispatch(setConnectionCredentialRequest({ id: "" }));
    setShowRequest(false);
    setInitiateAnimation(false);
  };

  const handleCancel = async () => {
    if (
      connectionCredentialRequest.type ===
      ConnectionCredentialRequestType.CREDENTIAL_OFFER_RECEIVED
    ) {
      await AriesAgent.agent.credentials.declineCredentialOffer(
        connectionCredentialRequest.id
      );
    }
    handleReset();
  };

  const handleConnect = async () => {
    setInitiateAnimation(true);
    if (
      connectionCredentialRequest.type ===
      ConnectionCredentialRequestType.CONNECTION_INCOMING
    ) {
      AriesAgent.agent.connections.acceptRequestConnection(
        connectionCredentialRequest.id
      );
    } else if (
      connectionCredentialRequest.type ===
      ConnectionCredentialRequestType.CONNECTION_RESPONSE
    ) {
      AriesAgent.agent.connections.acceptResponseConnection(
        connectionCredentialRequest.id
      );
    } else if (
      connectionCredentialRequest.type ===
      ConnectionCredentialRequestType.CREDENTIAL_OFFER_RECEIVED
    ) {
      AriesAgent.agent.credentials.acceptCredentialOffer(
        connectionCredentialRequest.id
      );
    }
    setTimeout(() => {
      handleReset();
    }, TOAST_MESSAGE_DELAY);
  };

  return (
    <IonPage
      className={`page-layout request safe-area ${
        showRequest ? "show" : "hide"
      } ${initiateAnimation ? "animation-on" : "animation-off"}`}
      data-testid="request"
    >
      <PageLayout
        footer={true}
        primaryButtonText={
          requestType === connectionType.connection
            ? `${i18n.t("request.button.connect")}`
            : `${i18n.t("request.button.accept-offer")}`
        }
        primaryButtonAction={() => setAlertIsOpen(true)}
        secondaryButtonText={`${i18n.t("request.button.cancel")}`}
        // add dismiss action if needed
        secondaryButtonAction={() => handleCancel()}
      >
        {requestType === connectionType.connection ? (
          <h2>{i18n.t("request.connection-title")}</h2>
        ) : (
          <h2>{i18n.t("request.credential-title")}</h2>
        )}
        <IonGrid className="request-content">
          <IonRow className="request-icons-row">
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
                src={requestData?.logo ?? CardanoLogo}
                alt="request-provider-logo"
              />
            </div>
          </IonRow>
          <IonRow className="request-info-row">
            <IonCol size="12">
              {requestType === connectionType.connection ? (
                <span>
                  {requestType + i18n.t("request.request-connection")}
                </span>
              ) : (
                <span>{requestType + i18n.t("request.offer-credential")}</span>
              )}
              <strong>{requestData?.label}</strong>
            </IonCol>
          </IonRow>
          <IonRow className="request-status">
            <IonCol size="12">
              <strong>
                {connectionCredentialRequest.type ===
                  ConnectionCredentialRequestType.CONNECTION_INCOMING ||
                connectionCredentialRequest.type ===
                  ConnectionCredentialRequestType.CREDENTIAL_OFFER_RECEIVED
                  ? i18next.t("request.pending", {
                    action: requestType,
                  })
                  : i18next.t("request.success", {
                    action: requestType,
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
        headerText={i18next.t(
          requestType === connectionType.connection
            ? "request.alert.title-confirm-connection"
            : "request.alert.title-confirm-credential",
          {
            initiator: requestData?.label,
          }
        )}
        confirmButtonText={
          requestType === connectionType.connection
            ? `${i18n.t("request.alert.confirm-connection")}`
            : `${i18n.t("request.alert.confirm-credential")}`
        }
        cancelButtonText={`${i18n.t("request.alert.cancel")}`}
        actionConfirm={handleConnect}
        actionCancel={handleCancel}
        actionDismiss={handleReset}
      />
    </IonPage>
  );
};

export { ConnectionCredentialRequest };
