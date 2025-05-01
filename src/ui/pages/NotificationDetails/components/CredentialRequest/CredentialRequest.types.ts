import { KeriaNotification } from "../../../../../core/agent/services/keriaNotificationService.types";
import {
  CredentialsMatchingApply,
  LinkedGroupInfo,
} from "../../../../../core/agent/services/ipexCommunicationService.types";
import { BackReason } from "../../../../components/CredentialDetailModule/CredentialDetailModule.types";

interface MemberInfo {
  aid: string;
  name: string;
  joined: boolean;
}

type LinkedGroup = LinkedGroupInfo & {
  memberInfos: MemberInfo[];
};

interface CredentialRequestProps {
  pageId: string;
  activeStatus: boolean;
  notificationDetails: KeriaNotification;
  credentialRequest: CredentialsMatchingApply;
  linkedGroup: LinkedGroup | null;
  userAID?: string | null;
  onAccept: () => void;
  onBack: () => void;
  onReloadData?: () => Promise<void>;
}

interface ChooseCredentialProps {
  pageId: string;
  activeStatus: boolean;
  credentialRequest: CredentialsMatchingApply;
  notificationDetails: KeriaNotification;
  linkedGroup: LinkedGroup | null;
  reloadData: () => void;
  onBack: () => void;
  onClose: () => void;
}

interface ACDC {
  v: string;
  d: string;
  i: string;
  ri: string;
  s: string;
  a: Attendee;
}

interface Attendee {
  d: string;
  i: string;
  dt: Date;
  attendeeName: string;
}

interface RequestCredential {
  connectionId: string;
  acdc: ACDC;
}

interface LightCredentialDetailModalProps {
  credId: string;
  isOpen: boolean;
  defaultSelected?: boolean;
  setIsOpen: (value: boolean) => void;
  onClose?: (reason: BackReason, isSelected: boolean, id: string) => void;
  joinedCredRequestMembers?: MemberInfo[];
  viewOnly?: boolean;
}

interface JoinedMemberProps {
  members: MemberInfo[] | null | undefined;
  onClick: () => void;
}

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  credName: string;
  members: MemberInfo[];
  threshold: number;
  joinedMembers: number;
}

export type {
  MembersModalProps,
  JoinedMemberProps,
  LightCredentialDetailModalProps,
  CredentialRequestProps,
  ChooseCredentialProps,
  RequestCredential,
  ACDC,
  LinkedGroup,
  MemberInfo,
};
