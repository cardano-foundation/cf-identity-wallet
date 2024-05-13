import { ReactNode, TransitionEvent } from "react";

interface SideSliderProps {
  open: boolean;
  children: ReactNode;
  duration?: number;
  zIndex?: number;
  onOpenAnimationEnd?: (event: TransitionEvent<HTMLDivElement>) => void;
  onCloseAnimationEnd?: (event: TransitionEvent<HTMLDivElement>) => void;
}

export type { SideSliderProps };
