interface CreateIdentifierProps {
  modalIsOpen: boolean;
  setModalIsOpen: (value: boolean) => void;
}

interface TypeItemProps {
  index: number;
  text: string;
  clickEvent: () => void;
  selectedType: number;
}

interface IdentifierThemeSelectorProps {
  identifierType: number;
  selectedTheme: number;
  setSelectedTheme: (value: number) => void;
}

interface ThemeItemProps {
  index: number;
}

export type {
  CreateIdentifierProps,
  TypeItemProps,
  IdentifierThemeSelectorProps,
  ThemeItemProps,
};
