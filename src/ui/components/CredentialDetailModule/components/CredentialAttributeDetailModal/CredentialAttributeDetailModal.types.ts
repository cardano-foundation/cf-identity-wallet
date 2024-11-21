import { ReactNode } from "react";

interface CredentialAttributeDetailModalProps {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}

export type { CredentialAttributeDetailModalProps };
