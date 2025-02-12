import { LensFacing } from "@capacitor-mlkit/barcode-scanning";
import { LoginAttempts } from "../../../core/agent/services/auth.types";
import { PeerConnectSigningEvent } from "../../../core/cardano/walletConnect/peerConnection.types";
import { OperationType, ToastMsgType } from "../../../ui/globals/types";
import { ConnectionData } from "../walletConnectionsCache";

interface PayloadData<T = any> {
  [key: string]: T;
}
interface CurrentRouteCacheProps {
  path: string;
  payload?: { [key: string]: PayloadData };
}

interface AuthenticationCacheProps {
  loggedIn: boolean;
  userName: string;
  time: number;
  passcodeIsSet: boolean;
  seedPhraseIsSet: boolean;
  passwordIsSet: boolean;
  passwordIsSkipped: boolean;
  ssiAgentIsSet: boolean;
  recoveryWalletProgress: boolean;
  loginAttempt: LoginAttempts;
  firstAppLaunch: boolean;
}
enum IncomingRequestType {
  PEER_CONNECT_SIGN = "peer-connect-sign",
}

type PeerConnectSigningEventRequest = {
  type: IncomingRequestType.PEER_CONNECT_SIGN;
  signTransaction: PeerConnectSigningEvent;
  peerConnection: ConnectionData;
};

type IncomingRequestProps = PeerConnectSigningEventRequest;

interface QueueProps<T> {
  isPaused: boolean;
  isProcessing: boolean;
  queues: T[];
}

interface ToastStackItem {
  id: string;
  message: ToastMsgType;
}

interface StateCacheProps {
  initialized: boolean;
  isOnline: boolean;
  routes: CurrentRouteCacheProps[];
  authentication: AuthenticationCacheProps;
  currentOperation: OperationType;
  queueIncomingRequest: QueueProps<IncomingRequestProps>;
  cameraDirection?: LensFacing;
  showGenericError?: boolean;
  showNoWitnessAlert?: boolean;
  showConnections: boolean;
  toastMsgs: ToastStackItem[];
}

export { IncomingRequestType };

export type {
  AuthenticationCacheProps,
  CurrentRouteCacheProps,
  IncomingRequestProps,
  PayloadData,
  PeerConnectSigningEventRequest,
  QueueProps,
  StateCacheProps,
  ToastStackItem,
};
