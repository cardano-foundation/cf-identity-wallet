import { ConnectionsProps } from "../../pages/Connections/Connections.types";

interface ConnectionOptionsProps {
  optionsIsOpen: boolean;
  setOptionsIsOpen: (value: boolean) => void;
  connectionDetails: ConnectionsProps;
  setConnectionDetails: (value: ConnectionsProps) => void;
}

export type { ConnectionOptionsProps };
