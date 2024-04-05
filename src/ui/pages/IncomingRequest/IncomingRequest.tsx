import { useEffect, useState } from "react";
import "./IncomingRequest.scss";
import {
  getQueueIncomingRequest,
  dequeueCredentialRequest,
} from "../../../store/reducers/stateCache";
import { AriesAgent } from "../../../core/agent/agent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  IncomingRequestProps,
  IncomingRequestType,
} from "../../../store/reducers/stateCache/stateCache.types";
import { ConnectionType } from "../../../core/agent/agent.types";
import { setConnectionsCache } from "../../../store/reducers/connectionsCache";
import { RequestComponent } from "./components/RequestComponent";

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
  const ANIMATION_DELAY = 4000;
  const [blur, setBlur] = useState(false);

  useEffect(() => {
    if (incomingRequest.id.length > 0) {
      setRequestData(incomingRequest);
      setShowRequest(true);
    }
  }, [incomingRequest]);

  useEffect(() => {
    if (blur) {
      document?.querySelector("ion-router-outlet")?.classList.add("blur");
    } else {
      document?.querySelector("ion-router-outlet")?.classList.remove("blur");
    }
  }, [blur]);

  const handleReset = () => {
    setInitiateAnimation(false);
    setShowRequest(false);
    setBlur(false);

    setTimeout(() => {
      dispatch(dequeueCredentialRequest());
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
      }
    } else if (
      incomingRequest.type === IncomingRequestType.CONNECTION_INCOMING ||
      incomingRequest.type === IncomingRequestType.CONNECTION_RESPONSE
    ) {
      // TODO: will handle with KERI connection if it is supported
      // await AriesAgent.agent.connections.deleteConnectionById(
      //   incomingRequest.id,
      //   ConnectionType.DIDCOMM
      // );
      // const updatedConnections =
      //   await AriesAgent.agent.connections.getConnections();
      // dispatch(setConnectionsCache([...updatedConnections]));
    } else if (
      incomingRequest.type === IncomingRequestType.MULTI_SIG_REQUEST_INCOMING
    ) {
      await AriesAgent.agent.credentials.deleteKeriNotificationRecordById(
        incomingRequest.id
      );
    }
    handleReset();
  };

  const handleAccept = async () => {
    setInitiateAnimation(true);
    if (incomingRequest.type === IncomingRequestType.CONNECTION_INCOMING) {
      // AriesAgent.agent.connections.acceptRequestConnection(incomingRequest.id);
    } else if (
      incomingRequest.type === IncomingRequestType.CONNECTION_RESPONSE
    ) {
      // AriesAgent.agent.connections.acceptResponseConnection(incomingRequest.id);
    } else if (
      incomingRequest.type === IncomingRequestType.CREDENTIAL_OFFER_RECEIVED
    ) {
      if (incomingRequest.source === ConnectionType.KERI) {
        AriesAgent.agent.credentials.acceptKeriAcdc(incomingRequest.id);
      } else {
        // AriesAgent.agent.credentials.acceptCredentialOffer(incomingRequest.id);
      }
    } else if (
      incomingRequest.type === IncomingRequestType.MULTI_SIG_REQUEST_INCOMING
    ) {
      AriesAgent.agent.credentials.deleteKeriNotificationRecordById(
        incomingRequest.id
      );
    }
    setTimeout(() => {
      handleReset();
    }, ANIMATION_DELAY);
  };

  const handleIgnore = async () => {
    if (
      incomingRequest.type === IncomingRequestType.MULTI_SIG_REQUEST_INCOMING
    ) {
      // @TODO - sdisalvo: placeholder for ignoring the request
      await AriesAgent.agent.signifyNotifications.dismissNotification(
        incomingRequest.id
      );
    }
    handleReset();
  };

  const defaultRequestData: IncomingRequestProps = {
    id: "",
  };

  return (
    <RequestComponent
      pageId={pageId}
      activeStatus={showRequest}
      blur={blur}
      setBlur={setBlur}
      requestData={requestData || defaultRequestData}
      initiateAnimation={initiateAnimation}
      handleAccept={handleAccept}
      handleCancel={handleCancel}
      handleIgnore={handleIgnore}
      incomingRequestType={incomingRequest.type}
    />
  );
};

export { IncomingRequest };
