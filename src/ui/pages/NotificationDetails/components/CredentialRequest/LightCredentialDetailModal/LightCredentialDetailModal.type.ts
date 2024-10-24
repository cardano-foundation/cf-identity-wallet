import { BackReason } from "../../../../../components/CredentialDetailModule/CredentialDetailModule.types";
import { MemberInfo } from "../CredentialRequest.types";

interface LightCredentialDetailModalProps {
  credId: string;
  isOpen: boolean;
  defaultSelected: boolean;
  setIsOpen: (value: boolean) => void;
  onClose: (reason: BackReason, isSelected: boolean, id: string) => void;
  joinedCredRequestMembers?: MemberInfo[];
  viewOnly?: boolean;
}

export type { LightCredentialDetailModalProps };
