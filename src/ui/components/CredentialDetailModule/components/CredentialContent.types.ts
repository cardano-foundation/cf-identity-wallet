import { ConnectionShortDetails } from "../../../../core/agent/agent.types";
import { ACDCDetails } from "../../../../core/agent/services/credentialService.types";

interface MemberInfo {
  aid: string;
  name: string;
  joinedCred?: string;
}

enum DetailView {
  Attributes = "attributes",
}

interface CredentialContentProps {
  cardData: ACDCDetails;
  joinedCredRequestMembers?: MemberInfo[];
  connectionShortDetails: ConnectionShortDetails | undefined;
  setOpenConnectionlModal: (value: boolean) => void;
}

export type { CredentialContentProps };

export { DetailView };
