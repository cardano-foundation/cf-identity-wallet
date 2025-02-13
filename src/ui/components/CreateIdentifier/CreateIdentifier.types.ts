import { IdentifierShortDetails } from "../../../core/agent/services/identifier.types";
import { IdentifierColor } from "./components/IdentifierColorSelector";

interface IdentifierModel
  extends Omit<
    IdentifierShortDetails,
    "creationStatus" | "theme" | "createdAtUTC"
  > {
  selectedAidType: number;
  selectedTheme: number;
  color: IdentifierColor;
}

interface CreateIdentifierProps {
  modalIsOpen: boolean;
  setModalIsOpen: (value: boolean) => void;
  onClose?: (identifierData?: IdentifierShortDetails) => void;
  groupId?: string;
}

export type { CreateIdentifierProps, IdentifierModel };
