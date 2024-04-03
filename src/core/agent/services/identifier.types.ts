import { ConnectionShortDetails } from "../agent.types";

enum IdentifierType {
  KERI = "keri",
}

interface IdentifierShortDetails {
  id: string;
  method: IdentifierType;
  displayName: string;
  createdAtUTC: string;
  signifyName?: string;
  colors: [string, string];
  theme: number;
  isPending: boolean;
}

type GetIdentifierResult = { type: IdentifierType.KERI; result: KERIDetails };

interface KERIDetails extends IdentifierShortDetails {
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

export { IdentifierType };

export type {
  IdentifierShortDetails,
  KERIDetails,
  GetIdentifierResult,
  MultiSigIcpRequestDetails,
};
