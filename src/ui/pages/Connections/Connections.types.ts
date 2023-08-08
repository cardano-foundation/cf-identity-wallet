interface ConnectionsProps {
  issuer: string;
  issuanceDate: string;
  issuerLogo: string;
  status: string;
}

interface ConnectionItemProps {
  key: number;
  item: ConnectionsProps;
}

interface ConnectionsComponentProps {
  setShowConnections: (value: boolean) => void;
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
