import { ConnectionData } from "../../../../../store/reducers/walletConnectionsCache";

interface WalletConnectStageOneProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  className?: string;
}

interface WalletConnectStageTwoProps {
  isOpen: boolean;
  data: ConnectionData;
  onClose: () => void;
  onBackClick: () => void;
  className?: string;
}

export type { WalletConnectStageOneProps, WalletConnectStageTwoProps };
