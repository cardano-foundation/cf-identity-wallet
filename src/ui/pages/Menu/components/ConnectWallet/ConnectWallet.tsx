import { useState } from "react";
import { i18n } from "../../../../../i18n";
import { CardsPlaceholder } from "../../../../components/CardsPlaceholder";
import "./ConnectWallet.scss";

export const ConnectWallet = () => {
  const pageId = "connect-wallet-placeholder";
  const [openConnectWallet, setOpenConnectWallet] = useState(false);
  const handleAddConnect = () => {
    setOpenConnectWallet(true);
  };

  return (
    <>
      <div className="connect-wallet-container">
        <div className="placeholder-container">
          <CardsPlaceholder
            buttonLabel={i18n.t("connectwallet.sections.connectbtn")}
            buttonAction={handleAddConnect}
            testId={pageId}
          />
        </div>
      </div>
    </>
  );
};
