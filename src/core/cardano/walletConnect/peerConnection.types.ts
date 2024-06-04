interface BaseEventEmitter {
  type: string;
  payload: Record<string, unknown>;
}

interface ExperimentalAPIFunctions {
  getIdentifierOobi: () => Promise<string>;
  sign: (
    identifier: string,
    payload: string
  ) => Promise<string | { error: PeerConnectionError }>;
}

enum PeerConnectionEventTypes {
  PeerConnectSign = "PeerConnectSign",
  PeerConnected = "PeerConnected",
  PeerDisconnected = "PeerDisconnected",
}

interface PeerConnectSigningEvent extends BaseEventEmitter {
  type: typeof PeerConnectionEventTypes.PeerConnectSign;
  payload: {
    identifier: string;
    payload: string;
    approvalCallback: (approvalStatus: boolean) => void;
  };
}

interface PeerConnectedEvent extends BaseEventEmitter {
  type: typeof PeerConnectionEventTypes.PeerConnected;
  payload: {
    identifier: string;
    dAppAddress: string;
  };
}

interface PeerDisconnectedEvent extends BaseEventEmitter {
  type: typeof PeerConnectionEventTypes.PeerDisconnected;
  payload: {
    dAppAddress: string;
  };
}

interface PeerConnectionError {
  code: number;
  info: string;
}

export const TxSignError: { [key: string]: PeerConnectionError } = {
  ProofGeneration: {
    code: 1,
    info: "User has accepted the transaction sign, but the wallet was unable to sign the transaction (e.g. not having some of the private keys).",
  },
  UserDeclined: { code: 2, info: "User declined to sign the transaction." },
  TimeOut: { code: 3, info: "Time out" },
};

export { PeerConnectionEventTypes };
export type {
  ExperimentalAPIFunctions,
  PeerConnectSigningEvent,
  PeerConnectedEvent,
  PeerDisconnectedEvent,
  PeerConnectionError,
};
