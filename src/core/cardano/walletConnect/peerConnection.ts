import { IConnectMessage } from "@fabianbormann/cardano-peer-connect/dist/src/types";
import { ExperimentalContainer } from "@fabianbormann/cardano-peer-connect";
import { IdentityWalletConnect } from "./identityWalletConnect";
import { ExperimentalAPIFunctions } from "./peerConnection.types";
import packageInfo from "../../../../package.json";
import ICON_BASE64 from "../../../assets/icon-only";
import { PreferencesStorage, PreferencesKeys } from "../../storage";

class PeerConnection {
  private walletInfo = {
    address: "",
    name: "idw_p2p",
    icon: ICON_BASE64,
    version: packageInfo.version,
    requestAutoconnect: true,
  };

  private announce = [
    "wss://tracker.openwebtorrent.com",
    "wss://dev.tracker.cf-identity-wallet.metadata.dev.cf-deployments.org",
    "wss://tracker.files.fm:7073/announce",
    "ws://tracker.files.fm:7072/announce",
    "wss://tracker.openwebtorrent.com:443/announce",
  ];

  private identityWalletConnect: IdentityWalletConnect | undefined;
  private connected = false;

  async start() {
    this.identityWalletConnect = new IdentityWalletConnect(
      this.walletInfo,
      (await PreferencesStorage.get(PreferencesKeys.APP_MEERKAT_SEED))
        ?.seed as string,
      this.announce
    );
    this.identityWalletConnect.setOnConnect(
      (connectMessage: IConnectMessage) => {
        this.connected = true;
      }
    );

    this.identityWalletConnect.setOnDisconnect(
      (connectMessage: IConnectMessage) => {
        this.connected = false;
      }
    );

    this.identityWalletConnect.setEnableExperimentalApi(
      new ExperimentalContainer<ExperimentalAPIFunctions>({
        getIdentifierId: this.identityWalletConnect.getIdentifierId,
        signData: this.identityWalletConnect.signDataWithIdentifier,
        getOobi: this.identityWalletConnect.generateOobi,
      })
    );
  }

  connectWithDApp(dAppIdentifier: string) {
    if (this.identityWalletConnect) {
      const seed = this.identityWalletConnect.connect(dAppIdentifier);
      PreferencesStorage.set(PreferencesKeys.APP_MEERKAT_SEED, {
        meerkatSeed: seed,
      });
      localStorage.setItem("meerkat-identity-wallet-seed", seed);
      this.connected = true;
    }
  }

  disconnectDApp(dAppIdentifier: string) {
    if (this.identityWalletConnect) {
      this.identityWalletConnect.disconnect(dAppIdentifier);
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected;
  }
}

export { PeerConnection };
