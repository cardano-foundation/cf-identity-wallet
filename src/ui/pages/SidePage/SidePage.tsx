import { useEffect, useRef, useState } from "react";
import { SideSlider } from "../../components/SideSlider";
import {
  getQueueIncomingRequest,
  setPauseQueueIncomingRequest,
} from "../../../store/reducers/stateCache";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getPendingConnection } from "../../../store/reducers/walletConnectionsCache";
import { IncomingRequest } from "./components/IncomingRequest";
import { WalletConnect } from "./components/WalletConnect";

const SidePage = () => {
  const dispatch = useAppDispatch();
  const [openSidePage, setOpenSidePage] = useState(false);
  const pauseIncommingRequestByConnection = useRef(false);

  const queueIncomingRequest = useAppSelector(getQueueIncomingRequest);
  const pendingConnection = useAppSelector(getPendingConnection);

  const canOpenIncomingRequest =
    queueIncomingRequest.queues.length > 0 && !queueIncomingRequest.isPaused;
  const canOpenPendingWalletConnection = !!pendingConnection;

  useEffect(() => {
    if (canOpenIncomingRequest) return;

    if (canOpenPendingWalletConnection && !queueIncomingRequest.isPaused) {
      dispatch(setPauseQueueIncomingRequest(true));
      pauseIncommingRequestByConnection.current = true;
    }
  }, [canOpenIncomingRequest, canOpenPendingWalletConnection]);

  const unpauseIncomingRequest = () => {
    if (pauseIncommingRequestByConnection.current) {
      dispatch(setPauseQueueIncomingRequest(false));
      pauseIncommingRequestByConnection.current = false;
    }
  };

  const getContent = () => {
    if (canOpenIncomingRequest)
      return (
        <IncomingRequest
          open={openSidePage}
          setOpenPage={setOpenSidePage}
        />
      );
    if (canOpenPendingWalletConnection)
      return (
        <WalletConnect
          open={openSidePage}
          setOpenPage={setOpenSidePage}
        />
      );
    return null;
  };

  return (
    <SideSlider
      onCloseAnimationEnd={unpauseIncomingRequest}
      open={openSidePage}
    >
      {getContent()}
    </SideSlider>
  );
};

export { SidePage };