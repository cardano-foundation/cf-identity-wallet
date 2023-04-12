import { ReactNode } from "react";

interface PageLayoutProps {
  backButton: boolean;
  backButtonPath: string;
  children: ReactNode;
  contentClasses: string;
  progressBar: boolean;
  progressBarValue: number;
  progressBarBuffer: number;
}

export type { PageLayoutProps };
