import { useEffect, useState, useMemo } from "react";
import "./IncomingRequest.scss";
import { Agent } from "../../../../../core/agent/agent";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  dequeueCredentialRequest,
  getQueueIncomingRequest,
} from "../../../../../store/reducers/stateCache";
import { SidePageContentProps } from "../../SidePage.types";
import { RequestComponent } from "./components/RequestComponent";
import {
  IncomingRequestProps,
  IncomingRequestType,
} from "../../../../../store/reducers/stateCache/stateCache.types";

const IncomingRequest = ({ open, setOpenPage }: SidePageContentProps) => {
  const pageId = "incoming-request";
  const dispatch = useAppDispatch();
  const queueIncomingRequest = useAppSelector(getQueueIncomingRequest);
  const incomingRequest = useMemo(() => {
    return !queueIncomingRequest.isProcessing
      ? { id: "" }
      : queueIncomingRequest.queues.length > 0
        ? queueIncomingRequest.queues[0]
        : { id: "" };
  }, [queueIncomingRequest]);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const [requestData, setRequestData] = useState<IncomingRequestProps>();
  const ANIMATION_DELAY = 4000;
  const [blur, setBlur] = useState(false);

  useEffect(() => {
    if (incomingRequest.id.length > 0) {
      setRequestData(incomingRequest);
      setOpenPage(true);
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
    setOpenPage(false);
    setBlur(false);

    setTimeout(() => {
      dispatch(dequeueCredentialRequest());
    }, 500);
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
    } else if (
      incomingRequest.type === IncomingRequestType.SIGN_TRANSACTION_REQUEST
    ) {
      incomingRequest.signTransaction?.payload.approvalCallback(false);
    }
    handleReset();
  };

  const handleAccept = async () => {
    setInitiateAnimation(true);
    if (
      incomingRequest.type === IncomingRequestType.CREDENTIAL_OFFER_RECEIVED
    ) {
      Agent.agent.ipexCommunications.acceptAcdc(incomingRequest.id);
    } else if (
      incomingRequest.type === IncomingRequestType.SIGN_TRANSACTION_REQUEST
    ) {
      incomingRequest.signTransaction?.payload.approvalCallback(true);
    }
    setTimeout(() => {
      handleReset();
    }, ANIMATION_DELAY);
  };

  const handleIgnore = async () => {
    if (
      incomingRequest.type === IncomingRequestType.MULTI_SIG_REQUEST_INCOMING
    ) {
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
      activeStatus={open}
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
