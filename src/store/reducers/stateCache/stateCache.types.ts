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
enum ConnectionRequestType {
  CONNECTION_RESPONSE = "connection-response",
  ISSUE_VC = "issue-vc",
  CONNECTION_INCOMING = "connection-incoming",
}

interface ConnectionRequestProps {
  id: string;
  type?: ConnectionRequestType;
}

interface StateCacheProps {
  routes: CurrentRouteCacheProps[];
  authentication: AuthenticationCacheProps;
  currentOperation: string;
  defaultCryptoAccount: string;
  connectionRequest: ConnectionRequestProps;
}

export { ConnectionRequestType };

export type {
  PayloadData,
  CurrentRouteCacheProps,
  AuthenticationCacheProps,
  StateCacheProps,
  ConnectionRequestProps,
};
