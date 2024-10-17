interface MultiSigMembersStatus {
  threshold: string | string[];
  accepted: boolean;
  membersJoined: string[];
  members: string[];
}

export type { MultiSigMembersStatus };
