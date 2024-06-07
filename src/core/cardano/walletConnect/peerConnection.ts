import { IConnectMessage } from "@fabianbormann/cardano-peer-connect/dist/src/types";
import { ExperimentalContainer } from "@fabianbormann/cardano-peer-connect";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";
import { IdentityWalletConnect } from "./identityWalletConnect";
import packageInfo from "../../../../package.json";
import ICON_BASE64 from "../../../assets/icon-only";
import { KeyStoreKeys } from "../../storage";
import { EventService } from "../../agent/services/eventService";
import {
  ExperimentalAPIFunctions,
  PeerConnectSigningEvent,
  PeerConnectedEvent,
  PeerConnectionBrokenEvent,
  PeerConnectionEventTypes,
  PeerDisconnectedEvent,
} from "./peerConnection.types";
import { Agent } from "../../agent/agent";
import { PeerConnectionStorage } from "../../agent/records";

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
  private connectedDAppAdress = "";
  private eventService = new EventService();
  private static instance: PeerConnection;

  onPeerConnectRequestSignStateChanged(
    callback: (event: PeerConnectSigningEvent) => void
  ) {
    this.eventService.on(
      PeerConnectionEventTypes.PeerConnectSign,
      async (event: PeerConnectSigningEvent) => {
        callback(event);
      }
    );
  }

  onPeerConnectedStateChanged(callback: (event: PeerConnectedEvent) => void) {
    this.eventService.on(
      PeerConnectionEventTypes.PeerConnected,
      async (event: PeerConnectedEvent) => {
        callback(event);
      }
    );
  }

  onPeerDisconnectedStateChanged(
    callback: (event: PeerDisconnectedEvent) => void
  ) {
    this.eventService.on(
      PeerConnectionEventTypes.PeerDisconnected,
      async (event: PeerDisconnectedEvent) => {
        callback(event);
      }
    );
  }

  onPeerConnectionBrokenStateChanged(
    callback: (event: PeerConnectionBrokenEvent) => void
  ) {
    this.eventService.on(
      PeerConnectionEventTypes.PeerConnectionBroken,
      async (event: PeerConnectionBrokenEvent) => {
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
      async (connectMessage: IConnectMessage) => {
        if (!connectMessage.error) {
          const { name, url, address, icon } = connectMessage.dApp;
          this.connectedDAppAdress = address;
          let iconB64 = ICON_BASE64;
          // Check if the icon is base64
          if (
            icon &&
            /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/.test(
              icon
            )
          ) {
            iconB64 = icon;
          }
          await Agent.agent.peerConnectionMetadataStorage.updatePeerConnectionMetadata(
            address,
            {
              name,
              selectedAid,
              url,
              iconB64: iconB64,
            }
          );
          this.eventService.emit<PeerConnectedEvent>({
            type: PeerConnectionEventTypes.PeerConnected,
            payload: {
              identifier: selectedAid,
              dAppAddress: address,
            },
          });
        }
      }
    );

    this.identityWalletConnect.setOnDisconnect(
      (disConnectMessage: IConnectMessage) => {
        this.connectedDAppAdress = "";
        this.eventService.emit<PeerDisconnectedEvent>({
          type: PeerConnectionEventTypes.PeerDisconnected,
          payload: {
            dAppAddress: disConnectMessage.address as string,
          },
        });
      }
    );

    this.identityWalletConnect.setEnableExperimentalApi(
      new ExperimentalContainer<ExperimentalAPIFunctions>({
        getIdentifierOobi: this.identityWalletConnect.getIdentifierOobi,
        sign: this.identityWalletConnect.sign,
        getConnectingAid: this.identityWalletConnect.getConnectingAid,
      })
    );
  }

  async connectWithDApp(dAppIdentifier: string) {
    if (this.identityWalletConnect === undefined) {
      throw new Error(PeerConnection.PEER_CONNECTION_START_PENDING);
    }
    const existingPeerConnection =
      await Agent.agent.peerConnectionMetadataStorage
        .getPeerConnectionMetadata(dAppIdentifier)
        .catch((error) => {
          if (
            error.message ===
            PeerConnectionStorage.PEER_CONNECTION_METADATA_RECORD_MISSING
          ) {
            return undefined;
          } else {
            throw error;
          }
        });
    if (!existingPeerConnection) {
      await Agent.agent.peerConnectionMetadataStorage.createPeerConnectionMetadataRecord(
        {
          id: dAppIdentifier,
          selectedAid: this.identityWalletConnect.getConnectingAid(),
          iconB64: ICON_BASE64,
        }
      );
    }
    const seed = this.identityWalletConnect.connect(dAppIdentifier);

    SecureStorage.set(KeyStoreKeys.MEERKAT_SEED, seed);
  }

  disconnectDApp(dAppIdentifier: string, isBroken?: boolean) {
    if (this.identityWalletConnect === undefined) {
      throw new Error(PeerConnection.PEER_CONNECTION_START_PENDING);
    }
    this.identityWalletConnect.disconnect(dAppIdentifier);

    if (isBroken) {
      this.eventService.emit<PeerConnectionBrokenEvent>({
        type: PeerConnectionEventTypes.PeerConnectionBroken,
        payload: {},
      });
    }
  }

  getConnectedDAppAddress() {
    return this.connectedDAppAdress;
  }

  getConnectingAid() {
    return this.identityWalletConnect?.getConnectingAid();
  }
}

export { PeerConnection };
