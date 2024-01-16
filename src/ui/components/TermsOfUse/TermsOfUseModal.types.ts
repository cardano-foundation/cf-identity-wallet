interface TermsOfUseModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

interface TermsOfUseSection {
  title: string;
  content: [
    {
      subtitle: string;
      text: string;
    }
  ];
}

interface TermsOfUseObject {
  done: string;
  intro: {
    title: string;
    text: string;
  };
  sections: TermsOfUseSection[];
}

export type { TermsOfUseModalProps, TermsOfUseSection, TermsOfUseObject };
