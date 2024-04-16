import { ConnectionNoteDetails } from "../../../../core/agent/agent.types";

interface ConnectionNoteProps {
  data: ConnectionNoteDetails;
  onDeleteNote: (noteId: string) => void;
  onNoteDataChange: (noteData: ConnectionNoteDetails) => void;
}

export type { ConnectionNoteProps };
