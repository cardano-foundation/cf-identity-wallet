import { RequestType } from "../../../../globals/types";

interface ConnectionsOptionModalProps {
  type: RequestType;
  connectModalIsOpen: boolean;
  setConnectModalIsOpen: (value: boolean) => void;
  handleProvideQr: () => Promise<void> | void;
}

export type { ConnectionsOptionModalProps };
