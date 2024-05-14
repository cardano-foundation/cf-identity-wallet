import { IConnectMessage } from "@fabianbormann/cardano-peer-connect/dist/src/types";
import { ExperimentalContainer } from "@fabianbormann/cardano-peer-connect";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { IdentityWalletConnect } from "./identityWalletConnect";
import { ExperimentalAPIFunctions } from "./peerConnection.types";
import packageInfo from "../../../../package.json";
import ICON_BASE64 from "../../../assets/icon-only";
import { KeyStoreKeys } from "../../storage";
import { EventService } from "../../agent/services/eventService";
import {
  PeerConnectSigningEvent,
  PeerConnectSigningEventTypes,
} from "../../agent/agent.types";

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
  private connectedDAppAdress = "";
  private eventService = new EventService();
  private static instance: PeerConnection;

  onPeerConnectRequestSignStateChanged(
    callback: (event: PeerConnectSigningEvent) => void
  ) {
    this.eventService.on(
      PeerConnectSigningEventTypes.PeerConnectSign,
      async (event: PeerConnectSigningEvent) => {
        callback(event);
      }
    );
  }

  static get peerConnection() {
    if (!this.instance) {
      this.instance = new PeerConnection();
    }
    return this.instance;
  }

  async start(selectedAid: string) {
    let meerkatSeed = null;

    try {
      meerkatSeed = (await SecureStorage.get(
        KeyStoreKeys.MEERKAT_SEED
      )) as string;
    } catch {
      meerkatSeed = null;
    }
    if (
      this.identityWalletConnect &&
      this.connectedDAppAdress.trim().length !== 0
    ) {
      this.disconnectDApp(this.connectedDAppAdress);
    }
    this.identityWalletConnect = new IdentityWalletConnect(
      this.walletInfo,
      meerkatSeed,
      this.announce,
      selectedAid,
      this.eventService
    );
    this.identityWalletConnect.setOnConnect(
      (connectMessage: IConnectMessage) => {
        if (!connectMessage.error) {
          this.connected = true;
          this.connectedDAppAdress = connectMessage.dApp.address;
        }
      }
    );

    this.identityWalletConnect.setOnDisconnect(
      (disConnectMessage: IConnectMessage) => {
        this.connected = false;
      }
    );

    this.identityWalletConnect.setEnableExperimentalApi(
      new ExperimentalContainer<ExperimentalAPIFunctions>({
        getIdentifierOobi: this.identityWalletConnect.getIdentifierOobi,
        sign: this.identityWalletConnect.sign,
      })
    );
  }

  connectWithDApp(dAppIdentifier: string) {
    if (this.identityWalletConnect === undefined) {
      throw new Error(PeerConnection.PEER_CONNECTION_START_PENDING);
    }

    const seed = this.identityWalletConnect.connect(dAppIdentifier);
    SecureStorage.set(KeyStoreKeys.MEERKAT_SEED, seed);
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
