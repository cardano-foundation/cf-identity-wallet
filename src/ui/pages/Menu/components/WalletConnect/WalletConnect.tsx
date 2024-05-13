import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getPendingConnection,
  setPendingConnections,
} from "../../../../../store/reducers/walletConnectionsCache";
import { SideSlider } from "../../../../components/SideSlider";
import { WalletConnectStageOne } from "./WalletConnectStageOne";
import { WalletConnectStageTwo } from "./WalletConnectStageTwo";

const WalletConnect = () => {
  const dispatch = useAppDispatch();
  const pendingConnection = useAppSelector(getPendingConnection);
  const [requestStage, setRequestStage] = useState(0);
  const [openSlide, setOpenSlide] = useState(false);

  useEffect(() => {
    setTimeout(() => setOpenSlide(!!pendingConnection), 10);
  }, [pendingConnection]);

  const changeToStageTwo = () => {
    setRequestStage(1);
  };

  const handleCloseWalletConnect = () => {
    setOpenSlide(false);
  };

  if (!pendingConnection) return null;

  return (
    <SideSlider
      onCloseAnimationEnd={() => {
        setRequestStage(0);
        dispatch(setPendingConnections(null));
      }}
      open={openSlide}
    >
      {requestStage === 0 ? (
        <WalletConnectStageOne
          isOpen={!!pendingConnection}
          onClose={handleCloseWalletConnect}
          onAccept={changeToStageTwo}
        />
      ) : (
        <WalletConnectStageTwo
          data={pendingConnection}
          isOpen={!!pendingConnection}
          onClose={handleCloseWalletConnect}
          onBackClick={() => setRequestStage(0)}
        />
      )}
    </SideSlider>
  );
};

export { WalletConnect };
