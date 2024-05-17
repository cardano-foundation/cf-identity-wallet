import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getPendingConnection,
  setPendingConnections,
} from "../../../../../store/reducers/walletConnectionsCache";
import { WalletConnectStageOne } from "./WalletConnectStageOne";
import { WalletConnectStageTwo } from "./WalletConnectStageTwo";
import { SidePageContentProps } from "../../SidePage.types";

const WalletConnect = ({ setOpenPage }: SidePageContentProps) => {
  const dispatch = useAppDispatch();
  const pendingConnection = useAppSelector(getPendingConnection);
  const [requestStage, setRequestStage] = useState(0);

  useEffect(() => {
    setTimeout(() => setOpenPage(!!pendingConnection), 10);
  }, [pendingConnection]);

  const changeToStageTwo = () => {
    setRequestStage(1);
  };

  const handleCloseWalletConnect = () => {
    setOpenPage(false);

    setTimeout(() => {
      dispatch(setPendingConnections(null));
    }, 500);
  };

  if (!pendingConnection) return null;

  if (requestStage === 0)
    return (
      <WalletConnectStageOne
        isOpen={!!pendingConnection}
        onClose={handleCloseWalletConnect}
        onAccept={changeToStageTwo}
      />
    );

  return (
    <WalletConnectStageTwo
      data={pendingConnection}
      isOpen={!!pendingConnection}
      onClose={handleCloseWalletConnect}
      onBackClick={() => setRequestStage(0)}
    />
  );
};

export { WalletConnect };
