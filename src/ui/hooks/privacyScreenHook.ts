import { useEffect, useRef, useCallback } from "react";
import { PrivacyScreen } from "@capacitor-community/privacy-screen";
import { Capacitor } from "@capacitor/core";

const usePrivacyScreen = (autoEnable = true) => {
  const unmount = useRef(false);

  const enablePrivacy = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    return PrivacyScreen.enable();
  }, []);

  const disablePrivacy = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    return PrivacyScreen.disable();
  }, []);

  useEffect(() => {
    if (!autoEnable) return;

    setTimeout(() => {
      if (unmount.current) return;
      enablePrivacy();
    }, 250);

    return () => {
      unmount.current = true;
      disablePrivacy();
    };
  }, [enablePrivacy, disablePrivacy, autoEnable]);

  return { enablePrivacy, disablePrivacy };
};

export { usePrivacyScreen };
