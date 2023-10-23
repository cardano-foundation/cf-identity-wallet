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
enum ConnectionCredentialRequestType {
  CONNECTION_RESPONSE = "connection-response",
  CREDENTIAL_OFFER_RECEIVED = "credential-offer-received",
  CONNECTION_INCOMING = "connection-incoming",
}

interface ConnectionCredentialRequestProps {
  id: string;
  type?: ConnectionCredentialRequestType;
  logo?: string;
  label?: string;
}

interface QueueProps<T> {
  isPaused: boolean;
  isProcessing: boolean;
  queues: T[];
}

interface StateCacheProps {
  routes: CurrentRouteCacheProps[];
  authentication: AuthenticationCacheProps;
  currentOperation: string;
  defaultCryptoAccount: string;
  queueConnectionCredentialRequest: QueueProps<ConnectionCredentialRequestProps>;
}

export { ConnectionCredentialRequestType };

export type {
  PayloadData,
  CurrentRouteCacheProps,
  AuthenticationCacheProps,
  StateCacheProps,
  ConnectionCredentialRequestProps,
  QueueProps,
};
