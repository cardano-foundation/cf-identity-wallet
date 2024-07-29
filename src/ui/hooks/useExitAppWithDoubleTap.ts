import { useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { BackEventPriorityType } from "../globals/types";
import { useIonHardwareBackButton } from "./useIonHardwareBackButton";
import { DOUBLE_TAP_DELAY } from "../globals/constants";

const useExitAppWithDoubleTap = (
  prevent?: boolean,
  priority = BackEventPriorityType.Page
) => {
  const lastBackButtonClick = useRef(0);

  useIonHardwareBackButton(
    priority,
    () => {
      const currentTime = Date.now();
      const isDoubleTap =
        currentTime - lastBackButtonClick.current < DOUBLE_TAP_DELAY;

      if (Capacitor.isNativePlatform() && isDoubleTap) {
        App.exitApp();
      }

      lastBackButtonClick.current = currentTime;
    },
    !!prevent
  );
};

export { useExitAppWithDoubleTap };
