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
        } else if (
          incomingRequest.type === IncomingRequestType.TUNNEL_REQUEST
        ) {
          // TODO:
        }
        setShowRequest(true);
      }
    }
    void handle();
  }, [incomingRequest.id]);

  const getContentByType = () => {
    if (!incomingRequest.id.length) return;

    switch (incomingRequest.type) {
    case IncomingRequestType.CONNECTION_INCOMING: {
      return {
        title: i18n.t("request.connection.title"),
        info: i18n.t("request.connection.requestconnection"),
        type: DIDCommRequestType.CONNECTION,
        status: i18next.t("request.pending", {
          action: incomingRequest.type,
        }),
        alert: {
          title: i18n.t("request.connection.alert.titleconfirm"),
          confirm: i18n.t("request.connection.alert.confirm"),
        },
        label: incomingRequest.label,
        logo: incomingRequest.logo,
        button: i18n.t("request.connection.button.label"),
      };
    }
    case IncomingRequestType.CONNECTION_RESPONSE: {
      return {
        title: i18n.t("request.connection.title"),
        info: i18n.t("request.connection.requestconnection"),
        type: DIDCommRequestType.CONNECTION,
        status: i18next.t("request.success", {
          action: incomingRequest.type,
        }),
        alert: {
          title: i18n.t("request.connection.alert.titleconfirm"),
          confirm: i18n.t("request.connection.alert.confirm"),
        },
        label: incomingRequest.label,
        logo: incomingRequest.logo,
        button: i18n.t("request.connection.button.label"),
      };
    }
    case IncomingRequestType.CREDENTIAL_OFFER_RECEIVED: {
      return {
        title: i18n.t("request.credential.title"),
        info: i18n.t("request.credential.offercredential"),
        type: DIDCommRequestType.CREDENTIAL,
        status: i18next.t("request.success", {
          action: incomingRequest.type,
        }),
        alert: {
          title: i18n.t("request.credential.alert.titleconfirm"),
          confirm: i18n.t("request.credential.alert.confirm"),
        },
        label: incomingRequest?.label || "W3C",
        logo: incomingRequest?.logo,
        button: i18n.t("request.credential.button.label"),
      };
    }
    case IncomingRequestType.TUNNEL_REQUEST: {
      return {
        title: i18n.t("request.tunnelreq.title"),
        info: i18n.t("request.tunnelreq.offerlogin"),
        type: "Login",
        status: i18next.t("request.pending", {
          action: incomingRequest.type,
        }),
        alert: {
          title: i18n.t("request.tunnelreq.alert.titleconfirm"),
          confirm: i18n.t("request.tunnelreq.alert.confirm"),
        },
        label: incomingRequest.label || "Web",
        logo: incomingRequest.logo,
        button: i18n.t("request.tunnelreq.button.label"),
        schema: incomingRequest.payload?.schema,
      };
    }
    default: {
      return undefined;
    }
    }
  };

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
    } else if (incomingRequest.type === IncomingRequestType.TUNNEL_REQUEST) {
      // @TODO - foconnor: This delete function should be in the SignifyNotificationService.
      await AriesAgent.agent.credentials.deleteKeriNotificationRecordById(
        incomingRequest.id
      );
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
    } else if (incomingRequest.type === IncomingRequestType.TUNNEL_REQUEST) {
      AriesAgent.agent.credentials.handleReqGrant(incomingRequest.id);
    }
    setTimeout(() => {
      handleReset();
    }, RESET_DELAY);
  };

  const content = getContentByType();
  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={showRequest}
      customClass={`${showRequest ? "show" : "hide"} ${
        initiateAnimation ? "animation-on" : "animation-off"
      }`}
    >
      <h2>{content?.title}</h2>
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
              src={content?.logo ?? CardanoLogo}
              alt="request-provider-logo"
            />
          </div>
        </div>
        <div className="request-info-row">
          <IonCol size="12">
            <span>{`${content?.type}${content?.info}`}</span>
            <strong>{content?.label}</strong>
          </IonCol>
        </div>
        {content?.schema !== undefined && (
          <div className="request-info-row">
            <IonCol size="12">
              <span>using credential</span>
              <strong>{content.schema}</strong>
            </IonCol>
          </div>
        )}
        <div className="request-status">
          <IonCol size="12">
            <strong>{content?.status}</strong>
          </IonCol>
        </div>
      </div>
      <PageFooter
        pageId={pageId}
        primaryButtonText={content?.button}
        primaryButtonAction={() => handleAccept()}
        secondaryButtonText={`${i18n.t("request.button.cancel")}`}
        secondaryButtonAction={() => handleCancel()}
      />
    </ResponsivePageLayout>
  );
};

export { IncomingRequest };
