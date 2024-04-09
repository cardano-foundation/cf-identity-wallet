import { ConnectionShortDetails } from "../../pages/Connections/Connections.types";

interface CreateIdentifierProps {
  modalIsOpen: boolean;
  setModalIsOpen: (value: boolean) => void;
}

interface TypeItemProps {
  dataTestId: string;
  index: number;
  text: string;
  clickEvent: () => void;
  selectedType: number;
}

interface IdentifierThemeSelectorProps {
  selectedTheme: number;
  setSelectedTheme: (value: number) => void;
}

interface ThemeItemProps {
  index: number;
}

interface IdentifierStageProps {
  state: {
    identifierCreationStage: number;
    displayNameValue: string;
    selectedAidType: number;
    selectedTheme: number;
    threshold: number;
    selectedConnections: ConnectionShortDetails[];
  };
  setState: (value: any) => void;
  componentId: string;
  setBlur?: (value: boolean) => void;
  resetModal: () => void;
}

export type {
  CreateIdentifierProps,
  TypeItemProps,
  IdentifierThemeSelectorProps,
  ThemeItemProps,
  IdentifierStageProps,
};
