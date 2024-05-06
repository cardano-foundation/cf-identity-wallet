import { ConnectionData } from "../../../../../store/reducers/walletConnectionsCache";

interface ConnectWalletOptionRef {
  openConnectWallet: () => void;
}

type ActionInfo = {
  type: "add" | "delete" | "connect" | "none";
  data?: ConnectionData;
};

export type { ConnectWalletOptionRef, ActionInfo };
