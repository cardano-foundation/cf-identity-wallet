interface ConnectionsProps {
  issuer: string;
  issuanceDate: string;
  issuerLogo: string;
}

interface FilteredConnectionsProps {
  issuer: string;
  issuanceDate: string;
  issuerLogo: string;
  status: string;
}

interface ConnectionItemProps {
  key: number;
  item: FilteredConnectionsProps;
}

interface ConnectionsComponentProps {
  setShowConnections: (value: boolean) => void;
}

interface MappedConnections {
  key: string;
  value: FilteredConnectionsProps[];
}

export type {
  ConnectionsProps,
  FilteredConnectionsProps,
  ConnectionItemProps,
  ConnectionsComponentProps,
  MappedConnections,
};
