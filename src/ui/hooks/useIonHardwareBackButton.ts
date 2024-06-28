import { useEffect } from "react";
import { BackEventPriorityType } from "../globals/types";

const useIonHardwareBackButton = (
  priority: BackEventPriorityType,
  handler: (processNextHandler: () => void) => void,
  prevent?: boolean
) => {
  useEffect(() => {
    if (prevent) return;

    function handleBack(event: any) {
      event.detail.register(priority, handler);
    }

    document.addEventListener("ionBackButton", handleBack);

    return () => {
      document.removeEventListener("ionBackButton", handleBack);
    };
  }, [prevent, handler]);
};

export { useIonHardwareBackButton };
