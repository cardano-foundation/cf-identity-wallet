interface BaseEventEmitter {
  type: string;
  payload: Record<string, unknown>;
}

interface ExperimentalAPIFunctions {
  getIdentifierOobi: () => Promise<string>;
  sign: (identifier: string, payload: string) => Promise<any>;
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

export const TxSignError = {
  ProofGeneration: {
    code: 1,
    info: "User has accepted the transaction sign, but the wallet was unable to sign the transaction (e.g. not having some of the private keys).",
  },
  UserDeclined: { code: 2, info: "User declined to sign the transaction." },
  TimeOut: { code: 3, info: "Time out" },
};

export { PeerConnectSigningEventTypes };
export type { ExperimentalAPIFunctions, PeerConnectSigningEvent };
