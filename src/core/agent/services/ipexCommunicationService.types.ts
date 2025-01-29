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

export type { CredentialsMatchingApply, LinkedGroupInfo };
