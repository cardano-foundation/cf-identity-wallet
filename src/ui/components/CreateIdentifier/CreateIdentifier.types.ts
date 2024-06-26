import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { MultiSigGroup } from "../../../store/reducers/identifiersCache/identifiersCache.types";
import { ConnectionShortDetails } from "../../pages/Connections/Connections.types";

interface CreateIdentifierProps {
  modalIsOpen: boolean;
  setModalIsOpen: (value: boolean) => void;
  resumeMultiSig?: IdentifierShortDetails | null;
  setResumeMultiSig?: (value: IdentifierShortDetails | null) => void;
  groupId?: string;
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

interface IdentifierStageStateProps {
  identifierCreationStage: number;
  displayNameValue: string;
  selectedAidType: number;
  selectedTheme: number;
  threshold: number;
  scannedConections: ConnectionShortDetails[];
  selectedConnections: ConnectionShortDetails[];
  newIdentifier: IdentifierShortDetails;
  ourIdentifier: string;
}

interface IdentifierStageProps {
  state: IdentifierStageStateProps;
  setState: (value: any) => void;
  componentId: string;
  setBlur?: (value: boolean) => void;
  resetModal: () => void;
  resumeMultiSig?: IdentifierShortDetails | null;
  multiSigGroup?: MultiSigGroup;
  setMultiSigGroup?: (value: MultiSigGroup) => void;
}

interface IdentifierStage1BodyProps {
  componentId: string;
  handleDone: () => void;
  handleInitiateMultiSig?: () => void;
  oobi: string;
  groupMetadata?: {
    groupId: string;
    groupInitiator: boolean;
    groupCreated: boolean;
  };
  scannedConections?: ConnectionShortDetails[];
  handleScanButton: () => void;
}

export type {
  CreateIdentifierProps,
  TypeItemProps,
  IdentifierThemeSelectorProps,
  ThemeItemProps,
  IdentifierStageStateProps,
  IdentifierStageProps,
  IdentifierStage1BodyProps,
};
