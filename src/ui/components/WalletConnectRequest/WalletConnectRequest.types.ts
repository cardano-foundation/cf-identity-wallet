import { ConnectionData } from "../../../store/reducers/walletConnectionsCache";

interface WalletConnectRequestStageOneProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  className?: string;
}

interface WalletConnectRequestStageTwoProps {
  isOpen: boolean;
  data: ConnectionData;
  onClose: () => void;
  onBackClick: () => void;
  className?: string;
}

export type {
  WalletConnectRequestStageOneProps,
  WalletConnectRequestStageTwoProps,
};
