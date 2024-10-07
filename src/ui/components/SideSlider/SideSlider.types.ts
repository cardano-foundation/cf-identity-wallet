import { ReactNode } from "react";

interface SideSliderProps {
  isOpen: boolean;
  children: ReactNode;
  duration?: number;
  zIndex?: number;
  renderAsModal?: boolean;
  className?: string;
}

export const ANIMATION_DURATION = 300;

export type { SideSliderProps };
