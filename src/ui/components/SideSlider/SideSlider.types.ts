import { ReactNode } from "react";

interface SideSliderProps {
  isOpen: boolean;
  children: ReactNode;
  duration?: number;
  zIndex?: number;
  renderAsModal?: boolean;
  onOpenAnimationEnd?: () => void;
  onCloseAnimationEnd?: () => void;
}

export const ANIMATION_DURATION = 500;

export type { SideSliderProps };
