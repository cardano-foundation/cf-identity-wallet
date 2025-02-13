enum MemberAcceptStatus {
  Accepted,
  Waiting,
  Rejected,
  None,
}

interface MemberProps {
  name: string;
  status?: MemberAcceptStatus;
}

export type { MemberProps };

export { MemberAcceptStatus };
