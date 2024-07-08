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
import { getConnectedWallet } from "../../../../../store/reducers/walletConnectionsCache";

const IncomingRequest = ({ open, setOpenPage }: SidePageContentProps) => {
  const pageId = "incoming-request";
  const dispatch = useAppDispatch();
  const queueIncomingRequest = useAppSelector(getQueueIncomingRequest);
  const connectedWallet = useAppSelector(getConnectedWallet);
  const incomingRequest = useMemo(() => {
    if (
      !queueIncomingRequest.isProcessing ||
      !queueIncomingRequest.queues.length
    ) {
      return;
    } else {
      return queueIncomingRequest.queues[0];
    }
  }, [queueIncomingRequest]);
  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const [requestData, setRequestData] = useState<IncomingRequestProps>();
  const ANIMATION_DELAY = 4000;
  const [blur, setBlur] = useState(false);

  useEffect(() => {
    if (!incomingRequest) {
      return;
    }
    if (
      incomingRequest.type === IncomingRequestType.PEER_CONNECT_SIGN &&
      (!connectedWallet ||
        connectedWallet.id !== incomingRequest.peerConnection?.id)
    ) {
      handleReset();
    }
    if (incomingRequest) {
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
    if (!incomingRequest) {
      return handleReset();
    }
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
    } else if (incomingRequest.type === IncomingRequestType.PEER_CONNECT_SIGN) {
      incomingRequest.signTransaction?.payload.approvalCallback(false);
    }
    handleReset();
  };

  const handleAccept = async () => {
    if (!incomingRequest) {
      return handleReset();
    }
    setInitiateAnimation(true);
    if (
      incomingRequest.type === IncomingRequestType.CREDENTIAL_OFFER_RECEIVED
    ) {
      Agent.agent.ipexCommunications.acceptAcdc(incomingRequest.id);
    } else if (incomingRequest.type === IncomingRequestType.PEER_CONNECT_SIGN) {
      incomingRequest.signTransaction?.payload.approvalCallback(true);
    }
    setTimeout(() => {
      handleReset();
    }, ANIMATION_DELAY);
  };

  if (!requestData) {
    return null;
  }
  return (
    <RequestComponent
      pageId={pageId}
      activeStatus={open}
      blur={blur}
      setBlur={setBlur}
      requestData={requestData}
      initiateAnimation={initiateAnimation}
      handleAccept={handleAccept}
      handleCancel={handleCancel}
      handleIgnore={handleReset}
    />
  );
};

export { IncomingRequest };
