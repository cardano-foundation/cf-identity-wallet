import { ConnectionShortDetails } from "../agent.types";

interface GroupMetadata {
  groupId: string;
  groupInitiator: boolean;
  groupCreated: boolean;
}

interface CreateIdentifierInputs {
  displayName: string;
  theme: number;
  groupMetadata?: GroupMetadata;
}

interface IdentifierShortDetails {
  id: string;
  displayName: string;
  createdAtUTC: string;
  signifyName: string;
  theme: number;
  isPending: boolean;
  groupMetadata?: GroupMetadata;
  multisigManageAid?: string;
}

interface IdentifierDetails extends IdentifierShortDetails {
  signifyOpName?: string;
  s: string;
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
  isPending: boolean;
}

export type {
  IdentifierShortDetails,
  IdentifierDetails,
  MultiSigIcpRequestDetails,
  CreateIdentifierInputs,
  CreateIdentifierResult,
};
