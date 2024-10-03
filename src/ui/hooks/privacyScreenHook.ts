import { useEffect, useRef, useState, useCallback } from "react";
import { PrivacyScreen } from "@capacitor-community/privacy-screen";
import { Capacitor } from "@capacitor/core";

const usePrivacyScreen = (enabled = true) => {
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
    if (!enabled) {
      disablePrivacy();
    } else {
      setTimeout(() => {
        if (unmount.current) return;
        enablePrivacy();
      }, 250);
    }

    return () => {
      unmount.current = true;
      disablePrivacy();
    };
  }, [enabled, enablePrivacy, disablePrivacy]);

  return { enablePrivacy, disablePrivacy };
};

export { usePrivacyScreen };
