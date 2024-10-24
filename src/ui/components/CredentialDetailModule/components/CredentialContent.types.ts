import { ACDCDetails } from "../../../../core/agent/services/credentialService.types";

interface MemberInfo {
  aid: string;
  name: string;
  joinedCred?: string;
}

interface CredentialContentProps {
  cardData: ACDCDetails;
  joinedCredRequestMembers?: MemberInfo[];
}

export type { CredentialContentProps };
