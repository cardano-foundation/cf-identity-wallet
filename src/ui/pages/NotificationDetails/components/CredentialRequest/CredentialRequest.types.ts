import { KeriaNotification } from "../../../../../core/agent/agent.types";
import { CredentialsMatchingApply } from "../../../../../core/agent/services/ipexCommunicationService.types";
import { BackReason } from "../../../../components/CredentialDetailModule/CredentialDetailModule.types";

interface CredentialRequestProps {
  pageId: string;
  activeStatus: boolean;
  notificationDetails: KeriaNotification;
  credentialRequest: CredentialsMatchingApply;
  onAccept: () => void;
  onBack: () => void;
}

interface ChooseCredentialProps {
  pageId: string;
  activeStatus: boolean;
  credentialRequest: CredentialsMatchingApply;
  notificationDetails: KeriaNotification;
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
  defaultSelected: boolean;
  setIsOpen: (value: boolean) => void;
  onClose: (reason: BackReason, isSelected: boolean, id: string) => void;
}

export type {
  LightCredentialDetailModalProps,
  CredentialRequestProps,
  ChooseCredentialProps,
  RequestCredential,
  ACDC,
};
