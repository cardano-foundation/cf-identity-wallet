import { ConnectionData } from "../../../../../store/reducers/walletConnectionsCache";

interface ConnectWalletOptionRef {
  openConnectWallet: () => void;
}

type ActionInfo = {
  type: ActionType;
  data?: ConnectionData;
};

enum ActionType {
  Add = "add",
  Delete = "delete",
  Connect = "connect",
  None = "none",
}

export { ActionType };

export type { ConnectWalletOptionRef, ActionInfo, ConnectionData };
