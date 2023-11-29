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
  getQueueConnectionCredentialRequest,
  dequeueCredentialCredentialRequest,
} from "../../../store/reducers/stateCache";
import { AriesAgent } from "../../../core/agent/agent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { DIDCommRequestType } from "../../globals/types";
import { TOAST_MESSAGE_DELAY } from "../../globals/constants";
import { ConnectionCredentialRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import CardanoLogo from "../../../ui/assets/images/CardanoLogo.jpg";
import { ConnectionType } from "../../../core/agent/agent.types";

const ConnectionCredentialRequest = () => {
  const dispatch = useAppDispatch();
  const queueConnectionCredentialRequest = useAppSelector(
    getQueueConnectionCredentialRequest
  );
  const connectionCredentialRequest =
    !queueConnectionCredentialRequest.isProcessing
      ? { id: "" }
      : queueConnectionCredentialRequest.queues[0] ?? { id: "" };
  const [showRequest, setShowRequest] = useState(false);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const [requestData, setRequestData] = useState<{
    label: string;
    logo?: string;
  }>();
  const [requestType, setRequestType] = useState<DIDCommRequestType>();

  useEffect(() => {
    async function handle() {
      if (connectionCredentialRequest.id.length > 0) {
        if (
          connectionCredentialRequest.type ===
            ConnectionCredentialRequestType.CONNECTION_INCOMING ||
          connectionCredentialRequest.type ===
            ConnectionCredentialRequestType.CONNECTION_RESPONSE
        ) {
          setRequestData({
            label: connectionCredentialRequest.label as string,
            logo: connectionCredentialRequest.logo as string,
          });
          setRequestType(DIDCommRequestType.CONNECTION);
        } else if (
          connectionCredentialRequest.type ===
          ConnectionCredentialRequestType.CREDENTIAL_OFFER_RECEIVED
        ) {
          if (connectionCredentialRequest.label) {
            setRequestData({
              label: connectionCredentialRequest.label,
              logo: connectionCredentialRequest.logo,
            });
          } else {
            // @TODO: handle case when connectionId is not present
            setRequestData({ label: "W3C" });
          }
          setRequestType(DIDCommRequestType.CREDENTIAL);
        }
        setShowRequest(true);
      }
    }
    void handle();
  }, [connectionCredentialRequest.id]);

  const handleReset = () => {
    setShowRequest(false);
    setInitiateAnimation(false);
    setTimeout(() => {
      dispatch(dequeueCredentialCredentialRequest());
    }, 0.5 * 1000);
  };

  const handleCancel = async () => {
    if (
      connectionCredentialRequest.type ===
      ConnectionCredentialRequestType.CREDENTIAL_OFFER_RECEIVED
    ) {
      if (connectionCredentialRequest.source === ConnectionType.KERI) {
        await AriesAgent.agent.credentials.deleteKeriNotificationRecordById(
          connectionCredentialRequest.id
        );
      } else {
        await AriesAgent.agent.credentials.declineCredentialOffer(
          connectionCredentialRequest.id
        );
      }
    } else if (
      connectionCredentialRequest.type ===
        ConnectionCredentialRequestType.CONNECTION_INCOMING ||
      connectionCredentialRequest.type ===
        ConnectionCredentialRequestType.CONNECTION_RESPONSE
    ) {
      // TODO: will handle with KERI connection if it is supported
      await AriesAgent.agent.connections.deleteConnectionById(
        connectionCredentialRequest.id,
        ConnectionType.DIDCOMM
      );
    }
    handleReset();
  };

  const handleAccept = async () => {
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
      if (connectionCredentialRequest.source === ConnectionType.KERI) {
        AriesAgent.agent.credentials.acceptKeriAcdc(
          connectionCredentialRequest.id
        );
      } else {
        AriesAgent.agent.credentials.acceptCredentialOffer(
          connectionCredentialRequest.id
        );
      }
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
        footer={!initiateAnimation}
        primaryButtonText={
          requestType === DIDCommRequestType.CONNECTION
            ? `${i18n.t("request.button.connect")}`
            : `${i18n.t("request.button.acceptoffer")}`
        }
        primaryButtonAction={() => handleAccept()}
        secondaryButtonText={`${i18n.t("request.button.cancel")}`}
        // add dismiss action if needed
        secondaryButtonAction={() => handleCancel()}
      >
        {requestType === DIDCommRequestType.CONNECTION ? (
          <h2>{i18n.t("request.connection.title")}</h2>
        ) : (
          <h2>{i18n.t("request.credential.title")}</h2>
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
              {requestType === DIDCommRequestType.CONNECTION ? (
                <span>
                  {requestType + i18n.t("request.connection.requestconnection")}
                </span>
              ) : (
                <span>
                  {requestType + i18n.t("request.credential.offercredential")}
                </span>
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
    </IonPage>
  );
};

export { ConnectionCredentialRequest };
