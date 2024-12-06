import { ReactNode } from "react";

interface CardsPlaceholderProps {
  buttonLabel?: string;
  buttonAction?: () => void;
  testId: string;
  children?: ReactNode;
}

export type { CardsPlaceholderProps };
