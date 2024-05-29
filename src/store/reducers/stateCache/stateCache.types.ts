import { KeriaNotification } from "../../../core/agent/agent.types";
import { MultiSigIcpRequestDetails } from "../../../core/agent/services/identifier.types";
import { OperationType, ToastMsgType } from "../../../ui/globals/types";
import { SignTransaction } from "../../../ui/pages/SidePage/components/IncomingRequest/components/SignTransactionRequest.types";

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
}
enum IncomingRequestType {
  CREDENTIAL_OFFER_RECEIVED = "credential-offer-received",
  MULTI_SIG_REQUEST_INCOMING = "multi-sig-request-incoming",
  SIGN_TRANSACTION_REQUEST = "sign-transaction-request",
}

interface IncomingRequestProps {
  id: string;
  type?: IncomingRequestType;
  logo?: string;
  label?: string;
  event?: KeriaNotification;
  multisigIcpDetails?: MultiSigIcpRequestDetails;
  signTransaction?: SignTransaction;
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
