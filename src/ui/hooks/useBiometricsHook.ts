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
import { PluginListenerHandle } from "@capacitor/core";
import { useActivityTimer } from "../components/AppWrapper/hooks/useActivityTimer";
import { PreferencesKeys, PreferencesStorage } from "../../core/storage";

const useBiometricAuth = () => {
  const [biometricInfo, setBiometricInfo] = useState<CheckBiometryResult>();
  const [biometricsIsEnabled, setBiometricsIsEnabled] = useState<
    boolean | undefined
  >(undefined);
  const { setPauseTimestamp } = useActivityTimer();

  useEffect(() => {
    checkBiometry();
    checkBiometryInPreferences();
  }, []);

  let appListener: PluginListenerHandle;
  useEffect(() => {
    const updateBiometrics = async () => {
      appListener = await BiometricAuth.addResumeListener(setBiometricInfo);
      try {
        appListener = await BiometricAuth.addResumeListener(setBiometricInfo);
      } catch (error) {
        if (error instanceof Error) {
          // TODO: handle error
        }
      }
    };
    updateBiometrics();
    return () => {
      appListener?.remove();
    };
  }, []);

  const checkBiometryInPreferences = async () => {
    try {
      const biometrics = await PreferencesStorage.get(
        PreferencesKeys.APP_BIOMETRY
      );
      setBiometricsIsEnabled(biometrics.enabled as boolean);
    } catch (e) {
      // TODO: handle error
    }
  };
  const checkBiometry = async () => {
    try {
      const biometricResult = await BiometricAuth.checkBiometry();
      setBiometricInfo(biometricResult);
      return biometricResult;
    } catch (error) {
      // TODO: error getting biometricInfo
    }
  };

  const handleBiometricAuth = async (): Promise<boolean | BiometryError> => {
    const biometricResult = await checkBiometry();
    if (!biometricResult?.isAvailable) {
      if (!biometricResult?.strongBiometryIsAvailable) {
        return new BiometryError(
          i18n.t("biometry.weakbiometry"),
          BiometryErrorType.biometryNotAvailable
        );
      }
      return new BiometryError(
        i18n.t("biometry.notavailable"),
        BiometryErrorType.biometryNotAvailable
      );
    }

    try {
      await BiometricAuth.authenticate({
        reason: i18n.t("biometry.reason") as string,
        cancelTitle: i18n.t("biometry.canceltitle") as string,
        iosFallbackTitle: i18n.t("biometry.iosfallbacktitle") as string,
        androidTitle: i18n.t("biometry.androidtitle") as string,
        androidSubtitle: i18n.t("biometry.androidsubtitle") as string,
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
    biometricsIsEnabled,
    biometricInfo,
    handleBiometricAuth,
    setBiometricsIsEnabled,
  };
};

export { useBiometricAuth };
