import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { BackEventPriorityType } from "../globals/types";

const useIonHardwareBackButton = (
  priority: BackEventPriorityType,
  handler: (processNextHandler: () => void) => void,
  prevent?: boolean
) => {
  useEffect(() => {
    if (prevent || !Capacitor.isNativePlatform()) return;

    function handleBack(event: Event) {
      (event as CustomEvent).detail.register(priority, handler);
    }

    document.addEventListener("ionBackButton", handleBack);

    return () => {
      document.removeEventListener("ionBackButton", handleBack);
    };
  }, [prevent, handler, priority]);
};

export { useIonHardwareBackButton };
