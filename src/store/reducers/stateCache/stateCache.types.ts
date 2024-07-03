import { KeriaNotification } from "../../../core/agent/agent.types";
import { MultiSigIcpRequestDetails } from "../../../core/agent/services/identifier.types";
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
}
enum IncomingRequestType {
  CREDENTIAL_OFFER_RECEIVED = "credential-offer-received",
  MULTI_SIG_REQUEST_INCOMING = "multi-sig-request-incoming",
  PEER_CONNECT_SIGN = "peer-connect-sign",
}

type MultiSigRequest = {
  id: string;
  event: KeriaNotification;
  type: IncomingRequestType.MULTI_SIG_REQUEST_INCOMING;
  multisigIcpDetails: MultiSigIcpRequestDetails;
};

type PeerConnectSigningEventRequest = {
  type: IncomingRequestType.PEER_CONNECT_SIGN;
  signTransaction: PeerConnectSigningEvent;
  peerConnection: ConnectionData;
};

type KeriaNotificationRequest = {
  id: string;
  type: IncomingRequestType.CREDENTIAL_OFFER_RECEIVED;
  logo: string;
  label: string;
};

type IncomingRequestProps =
  | KeriaNotificationRequest
  | MultiSigRequest
  | PeerConnectSigningEventRequest;

interface QueueProps<T> {
  isPaused: boolean;
  isProcessing: boolean;
  queues: T[];
}

interface StateCacheProps {
  initialized: boolean;
  routes: CurrentRouteCacheProps[];
  authentication: AuthenticationCacheProps;
  currentOperation: OperationType;
  toastMsg?: ToastMsgType;
  queueIncomingRequest: QueueProps<IncomingRequestProps>;
}

export { IncomingRequestType };

export type {
  PayloadData,
  CurrentRouteCacheProps,
  AuthenticationCacheProps,
  StateCacheProps,
  IncomingRequestProps,
  QueueProps,
  PeerConnectSigningEventRequest,
};
