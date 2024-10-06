import { ReactNode } from "react";

interface TermsModalProps {
  name: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  children?: ReactNode;
}

interface TermContent {
  subtitle: string;
  text: string;
}

interface TermsSection {
  title: string;
  content: TermContent[];
  componentId: string;
}

interface TermsObject {
  done: string;
  intro: {
    title: string;
    text: string;
  };
  sections: TermsSection[];
}

export type { TermsModalProps, TermsSection, TermsObject, TermContent };
