import { ConnectionsProps } from "../Connections/Connections.types";

interface ConnectionDetailsProps {
  connectionDetails: ConnectionsProps;
  setShowConnectionDetails: (value: boolean) => void;
}

export type { ConnectionDetailsProps };
