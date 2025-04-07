import { useEffect, useState, useMemo } from "react";
import "./IncomingRequest.scss";
import { SidePageContentProps } from "../../components/SidePage/SidePage.types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  dequeueIncomingRequest,
  getQueueIncomingRequest,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { SignRequest } from "./components/SignRequest";
import { VerifyRequest } from "./components/VerifyRequest";
import {
  IncomingRequestType,
  PeerConnectVerifyingEventRequest,
  PeerConnectSigningEventRequest,
} from "../../../store/reducers/stateCache/stateCache.types";
import { getConnectedWallet } from "../../../store/reducers/walletConnectionsCache";
import { ToastMsgType } from "../../globals/types";

const IncomingRequest = ({ open, setOpenPage }: SidePageContentProps) => {
  const pageId = "incoming-request";
  const dispatch = useAppDispatch();
  const queueIncomingRequest = useAppSelector(getQueueIncomingRequest);
  const connectedWallet = useAppSelector(getConnectedWallet);

  type RequestDataType =
    | PeerConnectSigningEventRequest
    | PeerConnectVerifyingEventRequest;

  const incomingRequest = useMemo(() => {
    if (
      !queueIncomingRequest.isProcessing ||
      !queueIncomingRequest.queues.length
    ) {
      return undefined;
    }
    return queueIncomingRequest.queues[0] as RequestDataType;
  }, [queueIncomingRequest]);

  const [initiateAnimation, setInitiateAnimation] = useState(false);
  const [requestData, setRequestData] = useState<RequestDataType | undefined>();
  const ANIMATION_DELAY = 4000;
  const [blur, setBlur] = useState(false);

  useEffect(() => {
    if (!incomingRequest) {
      setRequestData(undefined);
      setOpenPage(false);
      return;
    }

    switch (incomingRequest.type) {
    case IncomingRequestType.PEER_CONNECT_SIGN:
      if (
        !connectedWallet ||
          connectedWallet.id !== incomingRequest.peerConnection?.id
      ) {
        handleReset();
        return;
      }
      break;
    case IncomingRequestType.PEER_CONNECT_VERIFY:
      if (
        !connectedWallet ||
          connectedWallet.id !== incomingRequest.peerConnection?.id
      ) {
        handleReset();
        return;
      }
      break;
    default:
      handleReset();
      return;
    }

    setRequestData(incomingRequest);
    setOpenPage(true);
  }, [connectedWallet, incomingRequest, setOpenPage]);

  useEffect(() => {
    const routerOutlet = document?.querySelector("ion-router-outlet");
    if (blur) {
      routerOutlet?.classList.add("blur");
    } else {
      routerOutlet?.classList.remove("blur");
    }
  }, [blur]);

  const handleReset = () => {
    setInitiateAnimation(false);
    setOpenPage(false);
    setBlur(false);

    setTimeout(() => {
      dispatch(dequeueIncomingRequest());
    }, 500);
  };

  const handleCancel = async () => {
    if (!incomingRequest) {
      return handleReset();
    }

    switch (incomingRequest.type) {
    case IncomingRequestType.PEER_CONNECT_SIGN:
      incomingRequest.signTransaction?.payload.approvalCallback(false);
      break;
    case IncomingRequestType.PEER_CONNECT_VERIFY:
      incomingRequest.verifyTransaction?.payload.approvalCallback(false);
      break;
    }
    handleReset();
  };

  const handleAccept = async () => {
    if (!incomingRequest) {
      return handleReset();
    }

    setInitiateAnimation(true);

    switch (incomingRequest.type) {
    case IncomingRequestType.PEER_CONNECT_SIGN:
      incomingRequest.signTransaction?.payload.approvalCallback(true);
      setTimeout(() => {
        handleReset();
        dispatch(setToastMsg(ToastMsgType.SIGN_SUCCESSFUL));
      }, ANIMATION_DELAY);
      break;
    case IncomingRequestType.PEER_CONNECT_VERIFY:
      incomingRequest.verifyTransaction?.payload.approvalCallback(true);
      setTimeout(() => {
        handleReset();
        // dispatch(setToastMsg(ToastMsgType.VERIFY_SUCCESSFUL));
      }, 2000);
      break;
    }
  };

  if (!requestData) {
    return null;
  }

  switch (requestData.type) {
  case IncomingRequestType.PEER_CONNECT_SIGN:
    return (
      <SignRequest
        pageId={pageId}
        activeStatus={open}
        blur={blur}
        setBlur={setBlur}
        requestData={requestData}
        initiateAnimation={initiateAnimation}
        handleAccept={handleAccept}
        handleCancel={handleCancel}
      />
    );
  case IncomingRequestType.PEER_CONNECT_VERIFY:
    return (
      <VerifyRequest
        pageId={pageId}
        activeStatus={open}
        blur={blur}
        setBlur={setBlur}
        requestData={requestData}
        initiateAnimation={initiateAnimation}
        handleAccept={handleAccept}
        handleCancel={handleCancel}
      />
    );
  default:
    return null;
  }
};

export { IncomingRequest };
