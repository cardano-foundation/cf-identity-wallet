import {
  ConnectionDetails,
  ConnectionNoteDetails,
} from "../../../../core/agent/agent.types";

interface EditConnectionsModalProps {
  notes: ConnectionNoteDetails[];
  setNotes: (value: ConnectionNoteDetails[]) => void;
  modalIsOpen: boolean;
  setModalIsOpen: (value: boolean) => void;
  connectionDetails: ConnectionDetails;
  onConfirm: () => void;
}

export type { EditConnectionsModalProps };
