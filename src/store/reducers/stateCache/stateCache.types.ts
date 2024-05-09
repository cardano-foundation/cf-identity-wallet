import { KeriaNotification } from "../../../core/agent/agent.types";
import { MultiSigIcpRequestDetails } from "../../../core/agent/services/identifier.types";
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
}
enum IncomingRequestType {
  CREDENTIAL_OFFER_RECEIVED = "credential-offer-received",
  MULTI_SIG_REQUEST_INCOMING = "multi-sig-request-incoming",
  WALLET_CONNECT_RECEIVED = "wallet-connect-recieved",
}

interface IncomingRequestProps {
  id: string;
  type?: IncomingRequestType;
  logo?: string;
  label?: string;
  event?: KeriaNotification;
  multisigIcpDetails?: MultiSigIcpRequestDetails;
  walletConnection?: ConnectionData;
}

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
};
