import { useEffect, useRef, useState } from "react";
import { SideSlider } from "../../components/SideSlider";
import {
  getQueueIncomingRequest,
  getStateCache,
} from "../../../store/reducers/stateCache";
import { useAppSelector } from "../../../store/hooks";
import {
  getIsConnecting,
  getPendingConnection,
} from "../../../store/reducers/walletConnectionsCache";
import { IncomingRequest } from "./components/IncomingRequest";
import { WalletConnect } from "./components/WalletConnect";
import { Connections } from "../Connections";

const SidePage = () => {
  const [openSidePage, setOpenSidePage] = useState(false);
  const pauseIncommingRequestByConnection = useRef(false);
  const queueIncomingRequest = useAppSelector(getQueueIncomingRequest);
  const pendingConnection = useAppSelector(getPendingConnection);
  const isConnecting = useAppSelector(getIsConnecting);
  const stateCache = useAppSelector(getStateCache);
  const canOpenIncomingRequest =
    queueIncomingRequest.queues.length > 0 && !queueIncomingRequest.isPaused;
  const canOpenPendingWalletConnection = !!pendingConnection;
  const canOpenConnections = stateCache.showConnections;

  useEffect(() => {
    if (!stateCache.authentication.loggedIn || isConnecting) return;
    setOpenSidePage(
      canOpenIncomingRequest ||
        canOpenPendingWalletConnection ||
        canOpenConnections
    );
    if (canOpenPendingWalletConnection) {
      pauseIncommingRequestByConnection.current = true;
    }
  }, [
    canOpenIncomingRequest,
    canOpenPendingWalletConnection,
    canOpenConnections,
    stateCache.authentication.loggedIn,
    isConnecting,
  ]);

  const getContent = () => {
    if (canOpenPendingWalletConnection) {
      return (
        <WalletConnect
          open={openSidePage}
          setOpenPage={setOpenSidePage}
        />
      );
    }

    if (canOpenIncomingRequest) {
      return (
        <IncomingRequest
          open={openSidePage}
          setOpenPage={setOpenSidePage}
        />
      );
    }

    if (canOpenConnections) {
      return (
        <Connections
          showConnections={openSidePage}
          setShowConnections={setOpenSidePage}
        />
      );
    }

    return null;
  };

  return (
    <SideSlider
      renderAsModal
      isOpen={openSidePage}
    >
      {getContent()}
    </SideSlider>
  );
};

export { SidePage };
