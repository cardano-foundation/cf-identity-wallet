import { PrivacyScreen } from "@capacitor-community/privacy-screen";
import { Capacitor } from "@capacitor/core";
import { useEffect, useRef } from "react";

const usePrivacyScreen = () => {
  const unmount = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    setTimeout(() => {
      if (unmount.current) return;
      PrivacyScreen.enable();
    }, 250);

    return () => {
      unmount.current = true;
      PrivacyScreen.disable();
    };
  }, []);
};

export { usePrivacyScreen };
