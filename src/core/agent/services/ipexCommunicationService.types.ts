import { Operation } from "signify-ts";
import { LinkedRequest } from "../records/notificationRecord.types";

interface CredentialsMatchingApply {
  schema: {
    name: string;
    description: string;
  };
  credentials: {
    connectionId: string;
    acdc: any;
  }[];
  attributes: Record<string, unknown>;
  identifier: string;
}

interface LinkedGroupInfo {
  threshold: string | string[];
  members: string[];
  othersJoined: string[];
  linkedRequest: LinkedRequest;
}

interface SubmitIPEXResult {
  op: Operation;
  exnSaid: string;
}

export type { CredentialsMatchingApply, LinkedGroupInfo, SubmitIPEXResult };
