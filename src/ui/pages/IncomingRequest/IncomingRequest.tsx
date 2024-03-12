import { useEffect, useState } from "react";
import "./IncomingRequest.scss";
import {
  getQueueIncomingRequest,
  dequeueCredentialCredentialRequest,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { AriesAgent } from "../../../core/agent/agent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { DIDCommRequestType, OperationType } from "../../globals/types";
import {
  IncomingRequestProps,
  IncomingRequestType,
} from "../../../store/reducers/stateCache/stateCache.types";
import { ConnectionType } from "../../../core/agent/agent.types";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { setConnectionsCache } from "../../../store/reducers/connectionsCache";
import RequestComponent from "./components/RequestComponent";
import { PageHeader } from "../../components/PageHeader";
import { i18n } from "../../../i18n";
import CardanoLogo from "../../../ui/assets/images/CardanoLogo.jpg";

const IncomingRequest = () => {
  const pageId = "incoming-request";
  const dispatch = useAppDispatch();
  const queueIncomingRequest = useAppSelector(getQueueIncomingRequest);
  const incomingRequest = !queueIncomingRequest.isProcessing
    ? { id: "" }
    : queueIncomingRequest.queues[0] ?? { id: "" };
  const [showRequest, setShowRequest] = useState(false);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const [requestData, setRequestData] = useState<IncomingRequestProps>();
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
            id: incomingRequest.id,
            label: incomingRequest.label,
            logo: incomingRequest.logo,
          });
          setRequestType(DIDCommRequestType.CONNECTION);
        } else if (
          incomingRequest.type === IncomingRequestType.CREDENTIAL_OFFER_RECEIVED
        ) {
          if (incomingRequest.label) {
            setRequestData({
              id: incomingRequest.id,
              label: incomingRequest.label,
              logo: incomingRequest.logo,
            });
          } else {
            // @TODO: handle case when connectionId is not present
            setRequestData({
              id: incomingRequest.id,
              label: "W3C",
            });
          }
          setRequestType(DIDCommRequestType.CREDENTIAL);
        } else if (
          incomingRequest.type ===
          IncomingRequestType.MULTI_SIG_REQUEST_INCOMING
        ) {
          // TODO: handle case when incomingRequest.type is MultiSig
        }
        setShowRequest(true);
      }
    }
    void handle();
    setRequestData({
      id: incomingRequest.id,
      label: "label",
      logo: CardanoLogo,
    });
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

  const handleIgnore = async () => {
    setShowRequest(false);
    dispatch(setCurrentOperation(OperationType.IDLE));
  };

  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={showRequest && requestData !== undefined}
      customClass={`${showRequest && requestData ? "show" : "hide"} ${
        initiateAnimation ? "animation-on" : "animation-off"
      }`}
      header={
        requestData &&
        incomingRequest.type ===
          IncomingRequestType.MULTI_SIG_REQUEST_INCOMING && (
          <PageHeader
            closeButton={true}
            closeButtonAction={() => handleIgnore()}
            closeButtonLabel={`${i18n.t("request.button.ignore")}`}
            title={`${i18n.t("request.multisig.title")}`}
          />
        )
      }
    >
      {requestData && (
        <RequestComponent
          pageId={pageId}
          requestData={requestData}
          handleAccept={handleAccept}
          handleCancel={handleCancel}
          incomingRequestType={incomingRequest.type}
        />
      )}
    </ResponsivePageLayout>
  );
};

export { IncomingRequest };
