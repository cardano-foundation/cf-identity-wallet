import {
  BiometricAuth,
  BiometryError,
  BiometryErrorType,
} from "@aparajita/capacitor-biometric-auth";
import {
  AndroidBiometryStrength,
  CheckBiometryResult,
} from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { PluginListenerHandle } from "@capacitor/core";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { useActivityTimer } from "../components/AppWrapper/hooks/useActivityTimer";
import { showError } from "../utils/error";
import { useAppDispatch } from "../../store/hooks";

const useBiometricAuth = () => {
  const dispatch = useAppDispatch();
  const [biometricInfo, setBiometricInfo] = useState<CheckBiometryResult>();
  const { setPauseTimestamp } = useActivityTimer();

  useEffect(() => {
    checkBiometrics();
  }, []);

  useEffect(() => {
    let appListener: PluginListenerHandle;

    const updateBiometrics = async () => {
      try {
        appListener = await BiometricAuth.addResumeListener(setBiometricInfo);
      } catch (error) {
        if (error instanceof Error) {
          showError("Unable to add biometric event", error, dispatch);
        }
      }
    };
    updateBiometrics();

    return () => {
      appListener?.remove();
    };
  }, [dispatch]);

  const checkBiometrics = async () => {
    const biometricResult = await BiometricAuth.checkBiometry();
    setBiometricInfo(biometricResult);
    return biometricResult;
  };

  const handleBiometricAuth = async (): Promise<boolean | BiometryError> => {
    const biometricResult = await checkBiometrics();

    if (!biometricResult?.strongBiometryIsAvailable) {
      return new BiometryError(
        "Biometry too weak",
        BiometryErrorType.biometryNotAvailable
      );
    } else if (!biometricResult?.isAvailable) {
      return new BiometryError(
        "Biometry not available",
        BiometryErrorType.biometryNotAvailable
      );
    }

    try {
      await BiometricAuth.authenticate({
        reason: t("biometry.reason") as string,
        cancelTitle: t("biometry.canceltitle") as string,
        iosFallbackTitle: t("biometry.iosfallbacktitle") as string,
        androidTitle: t("biometry.androidtitle") as string,
        androidSubtitle: t("biometry.androidsubtitle") as string,
        androidConfirmationRequired: false,
        androidBiometryStrength: AndroidBiometryStrength.strong,
      });

      setPauseTimestamp(new Date().getTime());
      return true;
    } catch (error) {
      if (error instanceof BiometryError) {
        return error;
      }
      return new BiometryError(`${error}`, BiometryErrorType.none);
    }
  };

  return {
    biometricInfo,
    handleBiometricAuth,
  };
};

export { useBiometricAuth };
