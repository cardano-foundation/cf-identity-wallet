interface ConnectionsProps {
  id: string;
  issuer: string;
  issuanceDate: string;
  issuerLogo: string;
  status: string;
  goalCodes?: string;
  handshakeProtocol?: string;
  requestAttachments?: string;
  serviceEndpoints?: string;
}

interface ConnectionItemProps {
  key: number;
  item: ConnectionsProps;
  handleShowConnectionDetails: (value: ConnectionsProps) => void;
}

interface ConnectionsComponentProps {
  setShowConnections: (value: boolean) => void;
}

interface MappedConnections {
  key: string;
  value: ConnectionsProps[];
}

interface ConnectionRequestData {
  label: string;
  goal_code: string;
  goal: string;
  handshake_protocols: string[];
  requestattach: string[];
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
  ConnectionsProps,
  ConnectionItemProps,
  ConnectionsComponentProps,
  MappedConnections,
  ConnectionRequestData,
};
