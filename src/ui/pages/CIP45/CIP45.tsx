import { useEffect } from "react";
import { useIonViewWillEnter } from "@ionic/react";
import { QRCode } from "react-qrcode-logo";
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./CIP45.scss";

import { i18n } from "../../../i18n";
import { TabLayout } from "../../components/layout/TabLayout";

const CIP45 = () => {
  const pageId = "cip45-tab";
  const dispatch = useAppDispatch();

  const {
    stakeAddress,
    accountBalance,
    disconnect,
    connect,
    dAppConnect,
    meerkatAddress,
    initDappConnect,
    cip45Address,
    connectedCip45Wallet,
  } = useCardano({
    limitNetwork: NetworkType.MAINNET,
  });

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.CIP45 }));
  });

  useEffect(() => {
    if (dAppConnect.current === null) {
      const verifyConnection = (
        walletInfo: any,
        callback: (granted: boolean, autoconnect: boolean) => void
      ) => {
        if (walletInfo.requestAutoconnect) {
          const accessAndAutoConnect = window.confirm(
            `Do you want to automatically connect to wallet ${walletInfo.name} (${walletInfo.address})?`
          );

          callback(accessAndAutoConnect, accessAndAutoConnect);
        } else {
          callback(
            window.confirm(
              `Do you want to connect to wallet ${walletInfo.name} (${walletInfo.address})?`
            ),
            true
          );
        }
      };

      const onApiInject = (name: string): void => {
        connect(name);
      };

      const onApiEject = (): void => {
        disconnect();
      };

      const onP2PConnect = (): void => {
        // TODO
      };

      initDappConnect(
        "Identity Wallet APP",
        "IDW",
        verifyConnection,
        onApiInject,
        onApiEject,
        [],
        onP2PConnect
      );
    }
  }, []);

  return (
    <TabLayout
      pageId={pageId}
      header={true}
      title={`${i18n.t("cip45.tab.title")}`}
      menuButton={true}
    >
      <div className="cip45-tab-content">
        {!stakeAddress && (
          <div>
            <QRCode value={meerkatAddress} />
            <h2>{`Meerkat Address: ${meerkatAddress}`}</h2>
          </div>
        )}

        {stakeAddress && (
          <div>
            <img src={connectedCip45Wallet.current?.icon} />
            <h2>{`Wallet Name: ${connectedCip45Wallet.current?.name}`}</h2>
            <h2>{`Stake Address: ${stakeAddress}`}</h2>
            <h2>{`Account Balance: ${accountBalance}`}</h2>
            <h2>{`CIP-45 Address: ${cip45Address.current}`}</h2>
          </div>
        )}
      </div>
    </TabLayout>
  );
};

export { CIP45 };
