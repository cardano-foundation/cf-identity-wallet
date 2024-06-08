interface ConnectionData {
  id: string;
  name?: string;
  url?: string;
  createdAt?: string;
  iconB64?: string;
  selectedAid?: string;
}

interface WalletConnectState {
  walletConnections: ConnectionData[];
  connectedWallet: string | null;
  pendingDAppMeerKat: string | null;
}

export type { ConnectionData, WalletConnectState };
