import { ReactNode } from "react";

interface InfoBlockProps {
  title: string;
  children: ReactNode;
}

interface NotesProps {
  title: string;
  message: string;
  id: string;
}

export type { InfoBlockProps, NotesProps };
