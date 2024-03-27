import { RequestType } from "../../globals/types";

interface ConnectModalProps {
  type: RequestType;
  connectModalIsOpen: boolean;
  setConnectModalIsOpen: (value: boolean) => void;
  handleProvideQr: () => Promise<void> | void;
}

export type { ConnectModalProps };
