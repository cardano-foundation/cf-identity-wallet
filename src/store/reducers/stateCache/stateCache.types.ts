import { KeriaNotification } from "../../../core/agent/agent.types";
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
  BALLOT_TRANSACTION_REQUEST = "ballot-transaction-request",
}

// TODO: Dummy type for ballot transaction. Should be remove when implement logic from core
interface BallotTransactionData {
  id: string;
  address: string;
  event: string;
  category: string;
  proposal: string;
  network: string;
  votedAt: string;
  votingPower: string;
}

interface BallotTransation {
  action: string;
  actionText: string;
  data: BallotTransactionData;
  slot: string;
  uri: string;
  ownerUrl: string;
  eventName: string;
}

interface IncomingRequestProps {
  id: string;
  type?: IncomingRequestType;
  logo?: string;
  label?: string;
  event?: KeriaNotification;
  multisigIcpDetails?: MultiSigIcpRequestDetails;
  ballotData?: BallotTransation;
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
  BallotTransation,
  BallotTransactionData,
  CurrentRouteCacheProps,
  AuthenticationCacheProps,
  StateCacheProps,
  IncomingRequestProps,
  QueueProps,
};
