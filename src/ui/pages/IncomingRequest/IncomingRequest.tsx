import { useEffect, useState } from "react";
import "./IncomingRequest.scss";
import {
  getQueueIncomingRequest,
  dequeueCredentialRequest,
} from "../../../store/reducers/stateCache";
import { Agent } from "../../../core/agent/agent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  IncomingRequestProps,
  IncomingRequestType,
} from "../../../store/reducers/stateCache/stateCache.types";
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
      await Agent.agent.signifyNotifications.deleteNotificationRecordById(
        incomingRequest.id
      );
    } else if (
      incomingRequest.type === IncomingRequestType.MULTI_SIG_REQUEST_INCOMING
    ) {
      await Agent.agent.signifyNotifications.deleteNotificationRecordById(
        incomingRequest.id
      );
    }
    handleReset();
  };

  const handleAccept = async () => {
    setInitiateAnimation(true);
    if (
      incomingRequest.type === IncomingRequestType.CREDENTIAL_OFFER_RECEIVED
    ) {
      Agent.agent.ipexCommunications.acceptKeriAcdc(incomingRequest.id);
    } else if (
      incomingRequest.type === IncomingRequestType.MULTI_SIG_REQUEST_INCOMING
    ) {
      Agent.agent.signifyNotifications.deleteNotificationRecordById(
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
      await Agent.agent.signifyNotifications.dismissNotification(
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
