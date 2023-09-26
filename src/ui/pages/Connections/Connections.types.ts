import {
  ConnectionDetails,
  ConnectionShortDetails,
} from "../../../core/aries/ariesAgent.types";

interface ConnectionItemProps {
  key: number;
  item: ConnectionShortDetails;
  handleShowConnectionDetails: (value: ConnectionShortDetails) => void;
}

interface ConnectionsComponentProps {
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
  requestattach: any[];
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
  ConnectionShortDetails,
  ConnectionDetails,
  ConnectionItemProps,
  ConnectionsComponentProps,
  MappedConnections,
  ConnectionRequestData,
};
