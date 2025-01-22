import { ConnectionShortDetails } from "../../../core/agent/agent.types";

interface ConnectionsOptionRef {
  handleConnectModalButton: () => void;
}

interface ConnectionItemProps {
  key: number;
  item: ConnectionShortDetails;
  handleShowConnectionDetails: (value: ConnectionShortDetails) => void;
}

interface ConnectionsComponentProps {
  showConnections: boolean;
  setShowConnections: (value: boolean) => void;
}

interface MappedConnections {
  key: string;
  value: ConnectionShortDetails[];
}

interface ConnectionRequestData {
  label: string;
  goal_code: string;
  goal: string;
  handshake_protocols: string[];
  requestattach: unknown[];
  service: {
    id: string;
    type: string;
    recipientKeys: string[];
    routingKeys: string[];
    serviceEndpoint: string;
  }[];
  profileUrl: string;
  public_did: string;
  type: string;
  id: string;
}

export type {
  ConnectionsOptionRef,
  ConnectionItemProps,
  ConnectionsComponentProps,
  MappedConnections,
  ConnectionRequestData,
};
