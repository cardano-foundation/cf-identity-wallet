import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { MultiSigGroup } from "../../../store/reducers/identifiersCache/identifiersCache.types";
import { ConnectionShortDetails } from "../../pages/Connections/Connections.types";
import { IdentifierColor } from "./components/IdentifierColorSelector";

interface CreateIdentifierProps {
  modalIsOpen: boolean;
  setModalIsOpen: (value: boolean) => void;
  resumeMultiSig?: IdentifierShortDetails | null;
  setResumeMultiSig?: (value: IdentifierShortDetails | null) => void;
  groupId?: string;
  preventRedirect?: boolean;
}

interface TypeItemProps {
  dataTestId: string;
  index: number;
  text: string;
  clickEvent: () => void;
  selectedType: number;
  disabled?: boolean;
}

interface IdentifierThemeSelectorProps {
  color: IdentifierColor;
  selectedTheme: number;
  setSelectedTheme: (value: number) => void;
}

interface ThemeItemProps {
  index: number;
  color: number;
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
  color: IdentifierColor;
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
  preventRedirect?: boolean;
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
