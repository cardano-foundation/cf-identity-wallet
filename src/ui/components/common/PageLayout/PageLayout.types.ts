import { ReactNode } from "react";

export interface PageLayoutProps {
  backButton: boolean;
  backButtonPath: string;
  children: ReactNode;
  contentClasses: string;
  progressBar: boolean;
  progressBarValue: number;
  progressBarBuffer: number;
}
