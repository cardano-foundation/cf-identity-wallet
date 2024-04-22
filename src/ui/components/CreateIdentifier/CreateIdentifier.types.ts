import { IdentifierShortDetails } from "../../../core/agent/services/identifierService.types";
import { ConnectionShortDetails } from "../../pages/Connections/Connections.types";

interface CreateIdentifierProps {
  modalIsOpen: boolean;
  setModalIsOpen: (value: boolean) => void;
  resumeMultiSig?: IdentifierShortDetails | null;
  setResumeMultiSig?: (value: IdentifierShortDetails | null) => void;
  invitationReceived?: boolean;
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
    newIdentifier: IdentifierShortDetails;
  };
  setState: (value: any) => void;
  componentId: string;
  setBlur?: (value: boolean) => void;
  resetModal: () => void;
  resumeMultiSig?: IdentifierShortDetails | null;
}

interface IdentifierStage1BodyProps {
  componentId: string;
  handleDone: () => void;
  oobi: string;
  handleScanButton: () => void;
}

export type {
  CreateIdentifierProps,
  TypeItemProps,
  IdentifierThemeSelectorProps,
  ThemeItemProps,
  IdentifierStageProps,
  IdentifierStage1BodyProps,
};
