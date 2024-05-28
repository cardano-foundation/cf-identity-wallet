import {
  PeerConnectSigningEvent,
  PeerConnectSigningEventTypes,
} from "../../core/cardano/walletConnect/peerConnection.types";

const signTransactionFix: PeerConnectSigningEvent = {
  type: PeerConnectSigningEventTypes.PeerConnectSign,
  payload: {
    identifier: "EN5dwY0N7RKn6OcVrK7ksIniSgPcItCuBRax2JFUpuRc",
    payload: "Hello",
    approvalCallback: (approvalStatus: boolean) => approvalStatus,
  },
};

export { signTransactionFix };
