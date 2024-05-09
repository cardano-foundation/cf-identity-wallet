import { useState, useEffect } from "react";
import {
  BiometricAuth,
  BiometryError,
  BiometryErrorType,
} from "@aparajita/capacitor-biometric-auth";
import {
  AndroidBiometryStrength,
  CheckBiometryResult,
} from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import i18n from "i18next";
import { useActivityTimer } from "../components/AppWrapper/hooks/useActivityTimer";

const useBiometricAuth = () => {
  const [biometricInfo, setBiometricInfo] = useState<CheckBiometryResult>();
  const { setPauseTimestamp } = useActivityTimer();

  useEffect(() => {
    checkBiometry();
  }, []);

  const checkBiometry = async () => {
    try {
      const biometricResult = await BiometricAuth.checkBiometry();
      setBiometricInfo(biometricResult);
      return biometricResult;
    } catch (error) {
      // TODO: error getting biometricInfo
    }
  };

  const handleBiometricAuth = async (): Promise<
    boolean | BiometryError | undefined
  > => {
    const biometricResult = await checkBiometry();
    if (!biometricResult?.isAvailable) {
      if (biometricResult?.strongReason?.includes("NSFaceIDUsageDescription")) {
        // TODO: handle error i18n.t("biometry.iosnotenabled")
      }
      return;
    }

    try {
      await BiometricAuth.authenticate({
        reason: i18n.t("biometry.reason") || "Please authenticate",
        cancelTitle: i18n.t("biometry.canceltitle") || "Cancel",
        allowDeviceCredential: true,
        iosFallbackTitle: i18n.t("biometry.iosfallbacktitle") || "Use passcode",
        androidTitle: i18n.t("biometry.androidtitle") || "Biometric login",
        androidSubtitle:
          i18n.t("biometry.androidsubtitle") ||
          "Log in using biometric authentication",
        androidConfirmationRequired: false,
        androidBiometryStrength: AndroidBiometryStrength.strong,
      });
      setPauseTimestamp(new Date().getTime());
      return true;
    } catch (error) {
      if (error instanceof BiometryError) {
        // TODO: Handle other biometry errors here
        return error;
      }
    }
  };

  return {
    biometricInfo,
    handleBiometricAuth,
  };
};

export { useBiometricAuth };
