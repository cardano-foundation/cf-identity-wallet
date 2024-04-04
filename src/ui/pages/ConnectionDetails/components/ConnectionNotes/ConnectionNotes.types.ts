import { ConnectionNoteDetails } from "../../../../../core/agent/agent.types";

export interface ConnectionNotesProps {
  notes: ConnectionNoteDetails[];
  onOptionButtonClick: () => void;
  pageId: string;
}
