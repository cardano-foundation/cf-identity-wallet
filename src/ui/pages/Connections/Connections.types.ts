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

export type {
  ConnectionsProps,
  FilteredConnectionsProps,
  ConnectionItemProps,
  ConnectionsComponentProps,
};
