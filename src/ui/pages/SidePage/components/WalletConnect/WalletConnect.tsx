import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getPendingDAppMeerkat,
  setPendingDAppMeerKat,
} from "../../../../../store/reducers/walletConnectionsCache";
import { WalletConnectStageOne } from "./WalletConnectStageOne";
import { WalletConnectStageTwo } from "./WalletConnectStageTwo";
import { SidePageContentProps } from "../../SidePage.types";
import { SideSlider } from "../../../../components/SideSlider";

const WalletConnect = ({ setOpenPage }: SidePageContentProps) => {
  const dispatch = useAppDispatch();
  const pendingDAppMeerkat = useAppSelector(getPendingDAppMeerkat);
  const [requestStage, setRequestStage] = useState(0);
  const [hiddenStageOne, setHiddenStageOne] = useState(false);

  useEffect(() => {
    setTimeout(() => setOpenPage(!!pendingDAppMeerkat), 10);
  }, [pendingDAppMeerkat]);

  const changeToStageTwo = () => {
    setTimeout(() => setHiddenStageOne(true), 400);
    setRequestStage(1);
  };

  const backToStageOne = () => {
    setHiddenStageOne(false);
    setRequestStage(0);
  };

  const handleCloseWalletConnect = () => {
    setOpenPage(false);

    setTimeout(() => {
      dispatch(setPendingDAppMeerKat(null));
    }, 500);
  };

  if (!pendingDAppMeerkat) return null;

  return (
    <div className="wallet-connect-container">
      {!hiddenStageOne && (
        <WalletConnectStageOne
          isOpen={!!pendingDAppMeerkat}
          onClose={handleCloseWalletConnect}
          onAccept={changeToStageTwo}
        />
      )}
      <SideSlider open={requestStage === 1}>
        <WalletConnectStageTwo
          pendingDAppMeerkat={pendingDAppMeerkat}
          isOpen={!!pendingDAppMeerkat}
          onClose={handleCloseWalletConnect}
          onBackClick={backToStageOne}
        />
      </SideSlider>
    </div>
  );
};

export { WalletConnect };
