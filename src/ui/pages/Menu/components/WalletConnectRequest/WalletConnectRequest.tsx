import { useEffect, useState } from "react";
import { WalletConnectRequestStageOne } from "./WalletConnectRequestStageOne";
import { WalletConnectRequestStageTwo } from "./WalletConnectRequestStageTwo";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getPendingConnection,
  setPendingConnections,
} from "../../../../../store/reducers/walletConnectionsCache";
import { combineClassNames } from "../../../../utils/style";

const WalletConnectRequest = () => {
  const dispatch = useAppDispatch();
  const pendingConnection = useAppSelector(getPendingConnection);
  const [requestStage, setRequestStage] = useState(0);
  const [hideAnimation, setHideAnimation] = useState(false);
  const [openAnimation, setOpenAnimation] = useState(false);

  useEffect(() => {
    setOpenAnimation(!!pendingConnection);
  }, [pendingConnection]);

  const changeToStageTwo = () => {
    setRequestStage(1);
    setOpenAnimation(false);
  };

  const handleCloseWalletConnect = () => {
    setHideAnimation(true);

    setTimeout(() => {
      setRequestStage(0);
      dispatch(setPendingConnections(null));
    }, 700);

    setTimeout(() => {
      setHideAnimation(false);
    }, 1000);
  };

  const stageOneClass = combineClassNames({
    close: hideAnimation,
    open: openAnimation,
  });

  if (!pendingConnection) return null;

  if (requestStage === 0)
    return (
      <WalletConnectRequestStageOne
        className={stageOneClass}
        isOpen={!!pendingConnection}
        onClose={handleCloseWalletConnect}
        onAccept={changeToStageTwo}
      />
    );

  return (
    <WalletConnectRequestStageTwo
      className={hideAnimation ? "close" : undefined}
      data={pendingConnection}
      isOpen={!!pendingConnection}
      onClose={handleCloseWalletConnect}
      onBackClick={() => setRequestStage(0)}
    />
  );
};

export { WalletConnectRequest };
