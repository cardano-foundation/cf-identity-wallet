import { ConnectionDetails } from "../../Connections/Connections.types";
import { ConnectionNoteDetails } from "../../../../core/agent/agent.types";

interface EditConnectionsModalProps {
  notes: ConnectionNoteDetails[];
  setNotes: (value: ConnectionNoteDetails[]) => void;
  coreNotes: ConnectionNoteDetails[];
  modalIsOpen: boolean;
  setModalIsOpen: (value: boolean) => void;
  currentNoteId: string;
  connectionDetails: ConnectionDetails;
  setAlertDeleteNoteIsOpen: (value: boolean) => void;
}

export type { EditConnectionsModalProps };
