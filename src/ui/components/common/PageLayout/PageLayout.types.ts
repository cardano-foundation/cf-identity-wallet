import { ReactNode } from "react";

export type PageLayoutProps = {
  backButton: boolean;
  backButtonPath: string;
  children: ReactNode;
  contentClasses: string;
  progressBar: boolean;
  progressBarValue: number;
  progressBarBuffer: number;
};
