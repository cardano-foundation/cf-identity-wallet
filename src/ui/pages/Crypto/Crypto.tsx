import {
  IonButton,
  IonInput,
  IonItem,
  useIonViewWillEnter,
} from "@ionic/react";
import { TabLayout } from "../../components/layout/TabLayout";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentRoute } from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../../../routes/paths";
import "./Crypto.scss";
import React, { useRef, useState } from "react";
import { IdentityWalletConnect } from "../../../core/cardano/IdentityWalletConnect";
import { IConnectMessage } from "@fabianbormann/cardano-peer-connect/dist/src/types";

const Crypto = () => {
  const pageId = "crypto-tab";
  const dispatch = useAppDispatch();

  useIonViewWillEnter(() => {
    dispatch(setCurrentRoute({ path: TabsRoutePath.CRYPTO }));
  });

  const [meerkatAddress, setMeerkatAddress] = useState("");

  const walletInfo = {
    address: "http://localhost:3002/home",
    name: "Identity Wallet",
    icon: "",
    version: "0.0.1",
    requestAutoconnect: true,
  };

  const announce = [
    "wss://tracker.openwebtorrent.com",
    "wss://dev.tracker.cf-identity-wallet.metadata.dev.cf-deployments.org",
    "wss://tracker.files.fm:7073/announce",
    "ws://tracker.files.fm:7072/announce",
    "wss://tracker.openwebtorrent.com:443/announce",
  ];

  const [identityPeerConnect, setIdentityPeerConnect] = React.useState(
    () =>
      new IdentityWalletConnect(
        walletInfo,
        localStorage.getItem("meerkat-identitywallet-seed"),
        announce
      )
  );

  identityPeerConnect.setOnConnect((connectMessage: IConnectMessage) => {
    identicon.current = identityPeerConnect.getIdenticon();

    setConnected(
      "Connected to " +
        connectMessage.dApp.name +
        " (" +
        connectMessage.dApp.address +
        " at: " +
        connectMessage.dApp.url +
        ")"
    );
  });

  identityPeerConnect.setOnDisconnect((connectMessage: IConnectMessage) => {
    identicon.current = null;
    setConnected("Disconnected");
  });

  const connectWithDApp = () => {
    if (identityPeerConnect) {
      const seed = identityPeerConnect.connect(dAppIdentifier);
      localStorage.setItem("meerkat-identitywallet-seed", seed);
    }
  };

  const disconnectDApp = () => {
    if (identityPeerConnect) {
      identityPeerConnect.disconnect(dAppIdentifier);
    }
  };

  const identicon = useRef<string | null>(null);
  const [connected, setConnected] = useState("Disconnected");
  const [dAppIdentifier, setDAppIdentifier] = useState("");

  return (
    <TabLayout
      pageId={pageId}
      header={true}
      menuButton={true}
    >
      <div className="crypto-tab-content">
        <IonItem className="address-container">
          <IonInput
            value={dAppIdentifier}
            onIonChange={(event) => setDAppIdentifier(`${event.target.value}`)}
            placeholder="dApp identifier"
          ></IonInput>
        </IonItem>

        <div>
          {connected === "Disconnected" ? (
            <IonButton
              onClick={connectWithDApp}
              fill="solid"
            >
              Connect
            </IonButton>
          ) : (
            <IonButton
              onClick={disconnectDApp}
              fill="solid"
            >
              Disconnect
            </IonButton>
          )}
        </div>

        <div>meerkatAddress: {meerkatAddress}</div>

        <div>{connected}</div>
      </div>
    </TabLayout>
  );
};

export { Crypto };
