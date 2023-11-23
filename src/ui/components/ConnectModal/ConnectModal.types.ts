import { DIDCommRequestType } from "../../globals/types";

interface ConnectModalProps {
  type: DIDCommRequestType;
  connectModalIsOpen: boolean;
  setConnectModalIsOpen: (value: boolean) => void;
  handleProvideQr: () => Promise<void> | void;
}

export type { ConnectModalProps };
