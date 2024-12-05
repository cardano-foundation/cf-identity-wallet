import { LinkedGroupRequest } from "../records/notificationRecord.types";

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

interface LinkedGroupInfoGrant {
  threshold: string | string[];
  members: string[];
  othersJoined: string[];
  linkedGroupRequest: LinkedGroupRequest;
}

export type { CredentialsMatchingApply, LinkedGroupInfoGrant };
