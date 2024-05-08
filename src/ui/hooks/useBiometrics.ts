// hooks/useBiometricAuth.js
import { useState, useEffect } from "react";
import {
  BiometricAuth,
  BiometryError,
  BiometryErrorType,
} from "@aparajita/capacitor-biometric-auth";
import { useDispatch } from "react-redux";
import { login } from "../../store/reducers/stateCache";
import { useActivityTimer } from "../components/AppWrapper/hooks/useActivityTimer";

const useBiometricAuth = () => {
  const [biometricInfo, setBiometricInfo] = useState<any>();
  const { setPauseTimestamp } = useActivityTimer();

  const checkBiometry = async () => {
    try {
      const biometricResult = await BiometricAuth.checkBiometry();
      setBiometricInfo(biometricResult);
      return biometricResult;
    } catch (error) {
      //console.error('Error checking biometry:', error);
    }
  };
  useEffect(() => {
    //checkBiometry();
  }, []);

  const handleBiometricAuth = async (): Promise<
    boolean | BiometryError | undefined
  > => {
    const biometricResult = await checkBiometry();
    if (!biometricResult?.isAvailable) {
      if (biometricResult?.strongReason?.includes("NSFaceIDUsageDescription")) {
        alert(
          "Please enable Face ID in your device settings or update the app for enhanced security."
        );
      }
      return;
    }

    try {
      await BiometricAuth.authenticate({
        reason: "Please authenticate",
        cancelTitle: "Cancel",
        allowDeviceCredential: true,
        iosFallbackTitle: "Use passcode",
        androidTitle: "Biometric login",
        androidSubtitle: "Log in using biometric authentication",
        androidConfirmationRequired: false,
      });
      setPauseTimestamp(new Date().getTime());
      return true;
    } catch (error) {
      if (
        error instanceof BiometryError &&
        error.code !== BiometryErrorType.userCancel
      ) {
        // Handle other biometry errors here
        //console.error('Biometry Error:', error.message);
      }
    }
  };

  return {
    biometricInfo,
    handleBiometricAuth,
  };
};

export { useBiometricAuth };
