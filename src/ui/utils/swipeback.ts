/**
 * Source of swipe back action ionic-framework version: 7.5.x. Used to custom swipe back action on our app.
 * github: https://github.com/ionic-team/ionic-framework/blob/7.5.x/core/src/utils/gesture/swipe-back.ts
 */
import { createGesture, Gesture, GestureDetail } from "@ionic/react";

const clamp = (min: number, n: number, max: number) => {
  return Math.max(min, Math.min(n, max));
};

const isRTL = (hostEl?: Pick<HTMLElement, "dir">) => {
  if (hostEl) {
    if (hostEl.dir !== "") {
      return hostEl.dir.toLowerCase() === "rtl";
    }
  }
  return document?.dir.toLowerCase() === "rtl";
};

const CANNOT_GET_DEFAULT_VIEW = "Cannot get default view of element";

export const createSwipeBackGesture = (
  el: HTMLElement,
  canStartHandler: () => boolean,
  onEndHandler: (shouldComplete: boolean, step: number, dur: number) => void,
  onStartHandler?: () => void,
  onMoveHandler?: (step: number) => void
): Gesture => {
  if (!el?.ownerDocument?.defaultView) {
    throw new Error(CANNOT_GET_DEFAULT_VIEW);
  }

  const win = el.ownerDocument.defaultView;
  let rtl = isRTL(el);

  /**
   * Determine if a gesture is near the edge
   * of the screen. If true, then the swipe
   * to go back gesture should proceed.
   */
  const isAtEdge = (detail: GestureDetail) => {
    const threshold = 50;
    const { startX } = detail;

    if (rtl) {
      return startX >= win.innerWidth - threshold;
    }

    return startX <= threshold;
  };

  const getDeltaX = (detail: GestureDetail) => {
    return rtl ? -detail.deltaX : detail.deltaX;
  };

  const getVelocityX = (detail: GestureDetail) => {
    return rtl ? -detail.velocityX : detail.velocityX;
  };

  const canStart = (detail: GestureDetail) => {
    /**
     * The user's locale can change mid-session,
     * so we need to check text direction at
     * the beginning of every gesture.
     */
    rtl = isRTL(el);

    return isAtEdge(detail) && canStartHandler();
  };

  const onMove = (detail: GestureDetail) => {
    // set the transition animation's progress
    const delta = getDeltaX(detail);
    const stepValue = delta / win.innerWidth;
    onMoveHandler?.(stepValue);
  };

  const onEnd = (detail: GestureDetail) => {
    // the swipe back gesture has ended
    const delta = getDeltaX(detail);
    const width = win.innerWidth;
    const stepValue = delta / width;
    const velocity = getVelocityX(detail);
    const z = width / 2.0;
    const shouldComplete = velocity >= 0 && (velocity > 0.2 || delta > z);

    const missing = shouldComplete ? 1 - stepValue : stepValue;
    const missingDistance = missing * width;
    let realDur = 0;
    if (missingDistance > 5) {
      const dur = missingDistance / Math.abs(velocity);
      realDur = Math.min(dur, 540);
    }

    onEndHandler(
      shouldComplete,
      stepValue <= 0 ? 0.01 : clamp(0, stepValue, 0.9999),
      realDur
    );
  };

  return createGesture({
    el,
    gestureName: "goback-swipe-custom",
    gesturePriority: 101.5,
    threshold: 10,
    canStart,
    onStart: onStartHandler,
    onMove,
    onEnd,
  });
};
