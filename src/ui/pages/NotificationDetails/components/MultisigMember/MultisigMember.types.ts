enum MemberAcceptStatus {
  Accepted,
  Waiting,
  Rejected,
}

interface MemberProps {
  name: string;
  status: MemberAcceptStatus;
}

export type { MemberProps };

export { MemberAcceptStatus };
