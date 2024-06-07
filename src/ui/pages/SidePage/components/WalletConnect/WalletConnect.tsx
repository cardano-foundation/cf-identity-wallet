import { useState } from "react";
import { useAppSelector } from "../../../../../store/hooks";
import { getPendingDAppMeerkat } from "../../../../../store/reducers/walletConnectionsCache";
import { SideSlider } from "../../../../components/SideSlider";
import { SidePageContentProps } from "../../SidePage.types";
import { WalletConnectStageOne } from "./WalletConnectStageOne";
import { WalletConnectStageTwo } from "./WalletConnectStageTwo";

const WalletConnect = ({ setOpenPage }: SidePageContentProps) => {
  const pendingDAppMeerkat = useAppSelector(getPendingDAppMeerkat);
  const [requestStage, setRequestStage] = useState(0);
  const [hiddenStageOne, setHiddenStageOne] = useState(false);

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
