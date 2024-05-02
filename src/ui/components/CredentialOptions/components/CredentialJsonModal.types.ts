import { ACDCDetails } from "../../../../core/agent/services/credentialService.types";

export interface CredentialJsonModalProps {
  cardData: ACDCDetails;
  isOpen: boolean;
  onDissmiss: () => void;
}
