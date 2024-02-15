import { useEffect, useState } from "react";
import { IonCol, IonIcon } from "@ionic/react";
import {
  checkmark,
  personCircleOutline,
  swapHorizontalOutline,
} from "ionicons/icons";
import i18next from "i18next";
import { i18n } from "../../../i18n";
import "./IncomingRequest.scss";
import {
  getQueueIncomingRequest,
  dequeueCredentialCredentialRequest,
} from "../../../store/reducers/stateCache";
import { AriesAgent } from "../../../core/agent/agent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { DIDCommRequestType } from "../../globals/types";
import { IncomingRequestType } from "../../../store/reducers/stateCache/stateCache.types";
import CardanoLogo from "../../../ui/assets/images/CardanoLogo.jpg";
import { ConnectionType } from "../../../core/agent/agent.types";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { PageFooter } from "../../components/PageFooter";
import { setConnectionsCache } from "../../../store/reducers/connectionsCache";

const IncomingRequest = () => {
  const pageId = "incoming-request";
  const dispatch = useAppDispatch();
  const queueIncomingRequest = useAppSelector(getQueueIncomingRequest);
  const incomingRequest = !queueIncomingRequest.isProcessing
    ? { id: "" }
    : queueIncomingRequest.queues[0] ?? { id: "" };
  const [showRequest, setShowRequest] = useState(false);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const [requestData, setRequestData] = useState<{
    label: string;
    logo?: string;
  }>();
  const [requestType, setRequestType] = useState<DIDCommRequestType>();
  const RESET_DELAY = 4000;

  useEffect(() => {
    async function handle() {
      if (incomingRequest.id.length > 0) {
        if (
          incomingRequest.type === IncomingRequestType.CONNECTION_INCOMING ||
          incomingRequest.type === IncomingRequestType.CONNECTION_RESPONSE
        ) {
          setRequestData({
            label: incomingRequest.label as string,
            logo: incomingRequest.logo as string,
          });
          setRequestType(DIDCommRequestType.CONNECTION);
        } else if (
          incomingRequest.type === IncomingRequestType.CREDENTIAL_OFFER_RECEIVED
        ) {
          if (incomingRequest.label) {
            setRequestData({
              label: incomingRequest.label,
              logo: incomingRequest.logo,
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
  }, [incomingRequest.id]);

  const handleReset = () => {
    setShowRequest(false);
    setInitiateAnimation(false);
    setTimeout(() => {
      dispatch(dequeueCredentialCredentialRequest());
    }, 0.5 * 1000);
  };

  const handleCancel = async () => {
    if (
      incomingRequest.type === IncomingRequestType.CREDENTIAL_OFFER_RECEIVED
    ) {
      if (incomingRequest.source === ConnectionType.KERI) {
        await AriesAgent.agent.credentials.deleteKeriNotificationRecordById(
          incomingRequest.id
        );
      } else {
        await AriesAgent.agent.credentials.declineCredentialOffer(
          incomingRequest.id
        );
      }
    } else if (
      incomingRequest.type === IncomingRequestType.CONNECTION_INCOMING ||
      incomingRequest.type === IncomingRequestType.CONNECTION_RESPONSE
    ) {
      // TODO: will handle with KERI connection if it is supported
      await AriesAgent.agent.connections.deleteConnectionById(
        incomingRequest.id,
        ConnectionType.DIDCOMM
      );
      const updatedConnections =
        await AriesAgent.agent.connections.getConnections();
      dispatch(setConnectionsCache([...updatedConnections]));
    }
    handleReset();
  };

  const handleAccept = async () => {
    setInitiateAnimation(true);
    if (incomingRequest.type === IncomingRequestType.CONNECTION_INCOMING) {
      AriesAgent.agent.connections.acceptRequestConnection(incomingRequest.id);
    } else if (
      incomingRequest.type === IncomingRequestType.CONNECTION_RESPONSE
    ) {
      AriesAgent.agent.connections.acceptResponseConnection(incomingRequest.id);
    } else if (
      incomingRequest.type === IncomingRequestType.CREDENTIAL_OFFER_RECEIVED
    ) {
      if (incomingRequest.source === ConnectionType.KERI) {
        AriesAgent.agent.credentials.acceptKeriAcdc(incomingRequest.id);
      } else {
        AriesAgent.agent.credentials.acceptCredentialOffer(incomingRequest.id);
      }
    }
    setTimeout(() => {
      handleReset();
    }, RESET_DELAY);
  };

  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={showRequest}
      additionalClassNames={`${showRequest ? "show" : "hide"} ${
        initiateAnimation ? "animation-on" : "animation-off"
      }`}
    >
      {requestType === DIDCommRequestType.CONNECTION ? (
        <h2>{i18n.t("request.connection.title")}</h2>
      ) : (
        <h2>{i18n.t("request.credential.title")}</h2>
      )}
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
              src={requestData?.logo ?? CardanoLogo}
              alt="request-provider-logo"
            />
          </div>
        </div>
        <div className="request-info-row">
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
        </div>
        <div className="request-status">
          <IonCol size="12">
            <strong>
              {incomingRequest.type ===
                IncomingRequestType.CONNECTION_INCOMING ||
              incomingRequest.type ===
                IncomingRequestType.CREDENTIAL_OFFER_RECEIVED
                ? i18next.t("request.pending", {
                  action: requestType,
                })
                : i18next.t("request.success", {
                  action: requestType,
                })}
            </strong>
          </IonCol>
        </div>
      </div>
      <PageFooter
        pageId={pageId}
        primaryButtonText={
          requestType === DIDCommRequestType.CONNECTION
            ? `${i18n.t("request.button.connect")}`
            : `${i18n.t("request.button.acceptoffer")}`
        }
        primaryButtonAction={() => handleAccept()}
        secondaryButtonText={`${i18n.t("request.button.cancel")}`}
        secondaryButtonAction={() => handleCancel()}
      />
    </ResponsivePageLayout>
  );
};

export { IncomingRequest };
