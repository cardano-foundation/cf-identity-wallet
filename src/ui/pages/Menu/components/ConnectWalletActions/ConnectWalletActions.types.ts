interface ConnectWalletActionsProps {
  openModal: boolean;
  closeModal: () => void;
  onInputPid: () => void;
  onQRScan: () => void;
}

enum CreateConnectMethod {
  ScanQR,
  InputPID,
  None,
}

export { CreateConnectMethod };

export type { ConnectWalletActionsProps };
