interface ConnectionNoteProps {
  title: string;
  message: string;
  id: string;
  notes: ConnectionNoteProps[];
  currentNoteId: string;
  setAlertDeleteNoteIsOpen: (isOpen: boolean) => void;
}

export type { ConnectionNoteProps };
