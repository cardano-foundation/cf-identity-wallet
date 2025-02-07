import { PeerConnectSigningEvent } from "../../../../../core/cardano/walletConnect/peerConnection.types";

interface UndpSignRequest {
    signTransaction?: PeerConnectSigningEvent;
}

export type { UndpSignRequest };