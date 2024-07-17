import { KeriaNotification } from "../../../../../core/agent/agent.types";
import { CredentialsMatchingApply } from "../../../../../core/agent/services/ipexCommunicationService.types";

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

export type {
  CredentialRequestProps,
  ChooseCredentialProps,
  RequestCredential,
  ACDC,
};
