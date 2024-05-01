import { IConnectMessage } from "@fabianbormann/cardano-peer-connect/dist/src/types";
import { ExperimentalContainer } from "@fabianbormann/cardano-peer-connect";
import { IdentityWalletConnect } from "./identityWalletConnect";
import { ExperimentalAPIFunctions } from "./peerConnection.types";
import packageInfo from "../../../../package.json";
import ICON_BASE64 from "../../../assets/icon-only";
import { PreferencesStorage, PreferencesKeys } from "../../storage";

class PeerConnection {
  static readonly PEER_CONNECTION_START_PENDING =
    "The PeerConnection.start() has not been called yet";

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
    let meerkatSeed = null;

    try {
      meerkatSeed = (
        await PreferencesStorage.get(PreferencesKeys.APP_MEERKAT_SEED)
      )?.seed as string;
    } catch {
      meerkatSeed = null;
    }

    this.identityWalletConnect = new IdentityWalletConnect(
      this.walletInfo,
      meerkatSeed,
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
        getIdentifierOobi: this.identityWalletConnect.getIdentifierOobi,
        sign: this.identityWalletConnect.sign,
        getOobi: this.identityWalletConnect.generateOobi,
      })
    );
  }

  connectWithDApp(dAppIdentifier: string) {
    if (this.identityWalletConnect === undefined) {
      throw new Error(PeerConnection.PEER_CONNECTION_START_PENDING);
    }

    const seed = this.identityWalletConnect.connect(dAppIdentifier);
    PreferencesStorage.set(PreferencesKeys.APP_MEERKAT_SEED, {
      meerkatSeed: seed,
    });
    this.connected = true;
  }

  disconnectDApp(dAppIdentifier: string) {
    if (this.identityWalletConnect === undefined) {
      throw new Error(PeerConnection.PEER_CONNECTION_START_PENDING);
    }

    this.identityWalletConnect.disconnect(dAppIdentifier);
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }
}

export { PeerConnection };
