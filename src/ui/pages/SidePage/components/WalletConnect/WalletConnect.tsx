import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getPendingDAppMeerkat,
  setPendingDAppMeerKat,
} from "../../../../../store/reducers/walletConnectionsCache";
import { WalletConnectStageOne } from "./WalletConnectStageOne";
import { WalletConnectStageTwo } from "./WalletConnectStageTwo";
import { SidePageContentProps } from "../../SidePage.types";

const WalletConnect = ({ setOpenPage }: SidePageContentProps) => {
  const dispatch = useAppDispatch();
  const pendingDAppMeerkat = useAppSelector(getPendingDAppMeerkat);
  const [requestStage, setRequestStage] = useState(0);

  useEffect(() => {
    setTimeout(() => setOpenPage(!!pendingDAppMeerkat), 10);
  }, [pendingDAppMeerkat]);

  const changeToStageTwo = () => {
    setRequestStage(1);
  };

  const handleCloseWalletConnect = () => {
    setOpenPage(false);

    setTimeout(() => {
      dispatch(setPendingDAppMeerKat(null));
    }, 500);
  };

  if (!pendingDAppMeerkat) return null;

  if (requestStage === 0) {
    return (
      <WalletConnectStageOne
        isOpen={!!pendingDAppMeerkat}
        onClose={handleCloseWalletConnect}
        onAccept={changeToStageTwo}
      />
    );
  }

  return (
    <WalletConnectStageTwo
      pendingDAppMeerkat={pendingDAppMeerkat}
      isOpen={!!pendingDAppMeerkat}
      onClose={handleCloseWalletConnect}
      onBackClick={() => setRequestStage(0)}
    />
  );
};

export { WalletConnect };
