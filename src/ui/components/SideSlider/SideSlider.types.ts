import { ReactNode, TransitionEvent } from "react";

interface SideSliderProps {
  open: boolean;
  children: ReactNode;
  duration?: number;
  zIndex?: number;
  renderAsModal?: boolean;
  onOpenAnimationEnd?: () => void;
  onCloseAnimationEnd?: () => void;
}

export type { SideSliderProps };
