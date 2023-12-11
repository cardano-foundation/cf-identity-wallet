import { ConnectionNoteDetails } from "../../../../core/agent/agent.types";

interface ConnectionNoteProps {
  title: string;
  message: string;
  id: string;
  notes: ConnectionNoteProps[];
  currentNoteId: string;
  setAlertDeleteNoteIsOpen: (isOpen: boolean) => void;
  setNotes: (value: ConnectionNoteDetails[]) => void;
}

export type { ConnectionNoteProps };
