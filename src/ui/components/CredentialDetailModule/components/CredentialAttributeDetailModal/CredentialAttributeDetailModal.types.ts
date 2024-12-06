import { ReactNode } from "react";
import { ACDCDetails } from "../../../../../core/agent/services/credentialService.types";

interface CredentialAttributeDetailModalProps {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}

interface CredentialAttributeContentProps {
  data: ACDCDetails;
}

export type { CredentialAttributeDetailModalProps, CredentialAttributeContentProps };
