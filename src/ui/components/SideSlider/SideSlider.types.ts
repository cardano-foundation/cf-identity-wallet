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

export const ANIMATION_DURATION = 500;

export type { SideSliderProps };
