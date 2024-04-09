import { ConnectionShortDetails } from "../agent.types";

interface IdentifierShortDetails {
  id: string;
  displayName: string;
  createdAtUTC: string;
  signifyName: string;
  colors: [string, string];
  theme: number;
  isPending: boolean;
}

interface IdentifierFullDetails extends IdentifierShortDetails {
  signifyOpName?: string;
  s: number;
  dt: string;
  kt: number;
  k: string[];
  nt: number;
  n: string[];
  bt: number;
  b: string[];
  di: string;
}

interface MultiSigIcpRequestDetails {
  ourIdentifier: IdentifierShortDetails;
  sender: ConnectionShortDetails;
  otherConnections: ConnectionShortDetails[];
  threshold: number;
}

interface CreateIdentifierResult {
  identifier: string;
  signifyName: string;
}

export type {
  IdentifierShortDetails,
  IdentifierFullDetails,
  MultiSigIcpRequestDetails,
  CreateIdentifierResult,
};
