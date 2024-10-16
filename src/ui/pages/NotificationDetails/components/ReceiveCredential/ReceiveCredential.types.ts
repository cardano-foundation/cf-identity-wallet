enum MemberAcceptStatus {
  Accepted,
  Waiting,
  Rejected,
}

interface MultiSigMembersStatus {
  threshold: string | string[];
  accepted: boolean;
  membersJoined: string[];
  members: string[];
}

interface MemberProps {
  name: string;
  status: MemberAcceptStatus;
}

export type { MemberProps, MultiSigMembersStatus };

export { MemberAcceptStatus };
