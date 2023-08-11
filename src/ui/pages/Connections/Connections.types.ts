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
  connectionsData: ConnectionsProps[];
}

interface MappedConnections {
  key: string;
  value: ConnectionsProps[];
}

export type {
  ConnectionsProps,
  ConnectionItemProps,
  ConnectionsComponentProps,
  MappedConnections,
};
