interface BaseEventEmitter {
  type: string;
  payload: Record<string, unknown>;
}

interface ExperimentalAPIFunctions {
  getIdentifierOobi: () => Promise<string>;
  sign: (identifier: string, payload: string) => Promise<string>;
}

enum PeerConnectSigningEventTypes {
  PeerConnectSign = "PeerConnectSign",
}

interface PeerConnectSigningEvent extends BaseEventEmitter {
  type: typeof PeerConnectSigningEventTypes.PeerConnectSign;
  payload: {
    identifier: string;
    payload: string;
    approvalCallback: (approvalStatus: boolean) => void;
  };
}

export { PeerConnectSigningEventTypes };
export type { ExperimentalAPIFunctions, PeerConnectSigningEvent };
