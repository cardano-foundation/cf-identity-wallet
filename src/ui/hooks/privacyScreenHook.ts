import { useEffect, useRef, useCallback } from "react";
import { PrivacyScreen } from "@capacitor-community/privacy-screen";
import { Capacitor } from "@capacitor/core";

const usePrivacyScreen = () => {
  const unmount = useRef(false);

  const enablePrivacy = useCallback(() => {
    if (!Capacitor.isNativePlatform()) return;
    PrivacyScreen.enable();
  }, []);

  const disablePrivacy = useCallback(() => {
    if (!Capacitor.isNativePlatform()) return;
    PrivacyScreen.disable();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (unmount.current) return;
      enablePrivacy();
    }, 250);

    return () => {
      unmount.current = true;
      disablePrivacy();
    };
  }, [enablePrivacy, disablePrivacy]);

  return { enablePrivacy, disablePrivacy };
};

export { usePrivacyScreen };
