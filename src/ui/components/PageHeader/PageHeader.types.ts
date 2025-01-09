import { ReactNode } from "react";
import { BackEventPriorityType } from "../../globals/types";

interface HardwareBackButtonConfig {
  prevent?: boolean;
  priority?: BackEventPriorityType;
  handler?: (processNextHandler?: () => void) => void;
}

interface PageHeaderProps {
  backButton?: boolean;
  beforeBack?: () => void;
  onBack?: () => void;
  currentPath?: string;
  children?: ReactNode;
  closeButton?: boolean;
  closeButtonAction?: () => void;
  closeButtonLabel?: string;
  closeButtonIcon?: string;
  actionButton?: boolean;
  actionButtonDisabled?: boolean;
  actionButtonAction?: () => void;
  actionButtonLabel?: string;
  actionButtonIcon?: string;
  progressBar?: boolean;
  progressBarValue?: number;
  progressBarBuffer?: number;
  title?: string;
  additionalButtons?: ReactNode;
  hardwareBackButtonConfig?: HardwareBackButtonConfig;
}

export type { PageHeaderProps, HardwareBackButtonConfig };
