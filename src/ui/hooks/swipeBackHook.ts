import { useEffect } from "react";
import { getPlatforms } from "@ionic/react";
import { createSwipeBackGesture } from "../utils/swipeback";

const useSwipeBack = (
  getSwipeEl: () => HTMLElement | null,
  canStartHandler: () => boolean,
  onEndHandler: (shouldComplete: boolean, step: number, dur: number) => void,
  onStartHandler?: () => void,
  onMoveHandler?: (step: number) => void
) => {
  useEffect(() => {
    const platforms = getPlatforms();
    if (!platforms.includes("mobile") && !platforms.includes("ios")) return;

    const swipeEl = getSwipeEl();

    if (!swipeEl) return;

    const swp = createSwipeBackGesture(
      swipeEl,
      canStartHandler,
      onEndHandler,
      onStartHandler,
      onMoveHandler
    );

    swp.enable();

    return () => {
      swp.destroy();
    };
  }, [
    canStartHandler,
    onEndHandler,
    onMoveHandler,
    onStartHandler,
    getSwipeEl,
  ]);
};

export { useSwipeBack };
