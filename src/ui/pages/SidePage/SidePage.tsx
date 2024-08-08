import { useEffect, useRef, useState } from "react";
import { SideSlider } from "../../components/SideSlider";
import {
  getQueueIncomingRequest,
  getStateCache,
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
  const stateCache = useAppSelector(getStateCache);

  const canOpenIncomingRequest =
    queueIncomingRequest.queues.length > 0 && !queueIncomingRequest.isPaused;
  const canOpenPendingWalletConnection = !!pendingConnection;

  useEffect(() => {
    if (!stateCache.authentication.loggedIn) return;
    setOpenSidePage(canOpenIncomingRequest || canOpenPendingWalletConnection);
    if (canOpenPendingWalletConnection) {
      pauseIncommingRequestByConnection.current = true;
    }
  }, [
    canOpenIncomingRequest,
    canOpenPendingWalletConnection,
    stateCache.authentication.loggedIn,
  ]);

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
      renderAsModal
      onCloseAnimationEnd={unpauseIncomingRequest}
      isOpen={openSidePage}
    >
      {getContent()}
    </SideSlider>
  );
};

export { SidePage };
