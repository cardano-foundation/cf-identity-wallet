import { ConnectionData } from "../../../../../store/reducers/walletConnectionsCache";

interface ConfirmConnectModalProps {
  openModal: boolean;
  closeModal: () => void;
  onConfirm: () => void;
  onReconnect?: () => void;
  onDeleteConnection: (data: ConnectionData) => void;
  isConnectModal: boolean;
  connectionData?: ConnectionData;
}

export type { ConfirmConnectModalProps };
