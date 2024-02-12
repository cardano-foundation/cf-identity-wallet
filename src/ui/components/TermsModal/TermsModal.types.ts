interface TermsModalProps {
  name: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

interface TermsSection {
  title: string;
  content: [
    {
      subtitle: string;
      text: string;
    }
  ];
}

interface TermsObject {
  done: string;
  intro: {
    title: string;
    text: string;
  };
  sections: TermsSection[];
}

export type { TermsModalProps, TermsSection, TermsObject };
