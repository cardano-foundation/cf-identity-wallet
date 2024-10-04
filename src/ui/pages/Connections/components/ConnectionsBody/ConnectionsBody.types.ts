import {
  ConnectionShortDetails,
  MappedConnections,
} from "../../Connections.types";

interface SearchInputProps {
  onFocus?: (value: boolean) => void;
  value: string;
  onInputChange: (value: string) => void;
}

interface ConnectionsBodyProps {
  onSearchFocus?: (value: boolean) => void;
  mappedConnections: MappedConnections[];
  handleShowConnectionDetails: (item: ConnectionShortDetails) => void;
}

interface SearchConnectionListProps {
  title: string;
  testId: string;
  connections: ConnectionShortDetails[];
  onItemClick: (item: ConnectionShortDetails) => void;
}

interface SearchConnectionContentProps {
  keyword: string;
  mappedConnections: MappedConnections[];
  onItemClick: (item: ConnectionShortDetails) => void;
}

export type {
  ConnectionsBodyProps,
  SearchInputProps,
  SearchConnectionListProps,
  SearchConnectionContentProps,
};
