import {
  ConnectionType,
  KeriNotification,
} from "../../../core/agent/agent.types";
import { MultiSigIcpRequestDetails } from "../../../core/agent/services/identifier.types";
import { OperationType, ToastMsgType } from "../../../ui/globals/types";

interface PayloadData<T = any> {
  [key: string]: T;
}
interface CurrentRouteCacheProps {
  path: string;
  payload?: { [key: string]: PayloadData };
}

interface AuthenticationCacheProps {
  loggedIn: boolean;
  time: number;
  passcodeIsSet: boolean;
  seedPhraseIsSet: boolean;
  passwordIsSet: boolean;
  passwordIsSkipped: boolean;
}
enum IncomingRequestType {
  CONNECTION_RESPONSE = "connection-response",
  CREDENTIAL_OFFER_RECEIVED = "credential-offer-received",
  CONNECTION_INCOMING = "connection-incoming",
  MULTI_SIG_REQUEST_INCOMING = "multi-sig-request-incoming",
}

interface IncomingRequestProps {
  id: string;
  type?: IncomingRequestType;
  logo?: string;
  label?: string;
  source?: ConnectionType;
  event?: KeriNotification;
  multisigIcpDetails?: MultiSigIcpRequestDetails;
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
