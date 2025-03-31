import { ConnectionShortDetails } from "../../../core/agent/agent.types";

interface ConnectionDetailsProps {
  connectionShortDetails: ConnectionShortDetails;
  handleCloseConnectionModal: () => void;
  restrictedOptions?: boolean;
}

export type { ConnectionDetailsProps };
