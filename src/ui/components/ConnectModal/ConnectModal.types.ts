interface ConnectModalProps {
  type: string;
  connectModalIsOpen: boolean;
  setConnectModalIsOpen: (value: boolean) => void;
  handleProvideQr: () => Promise<void> | void;
}

export type { ConnectModalProps };
