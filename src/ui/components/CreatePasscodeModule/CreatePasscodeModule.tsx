import { BiometryErrorType } from "@aparajita/capacitor-biometric-auth";
import { BiometryError } from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { getPlatforms } from "@ionic/react";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { i18n } from "../../../i18n";
import { useAppDispatch } from "../../../store/hooks";
import { setEnableBiometryCache } from "../../../store/reducers/biometryCache";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { useBiometricAuth } from "../../hooks/useBiometricsHook";
import { Alert } from "../Alert";
import { ErrorMessage } from "../ErrorMessage";
import { PageFooter } from "../PageFooter";
import { PasscodeModule } from "../PasscodeModule";
import "./CreatePasscodeModule.scss";
import {
  CreatePasscodeModuleProps,
  CreatePasscodeModuleRef,
} from "./CreatePasscodeModule.types";

const CreatePasscodeModule = forwardRef<
  CreatePasscodeModuleRef,
  CreatePasscodeModuleProps
>(({ testId, title, description, onCreateSuccess, onPasscodeChange }, ref) => {
  const dispatch = useAppDispatch();
  const [passcode, setPasscode] = useState("");
  const [showSetupAndroidBiometryAlert, setShowSetupAndroidBiometryAlert] =
    useState(false);
  const [showCancelBiometryAlert, setShowCancelBiometryAlert] = useState(false);
  const [originalPassCode, setOriginalPassCode] = useState("");
  const { handleBiometricAuth, biometricInfo } = useBiometricAuth();
  const isAndroidDevice = getPlatforms().includes("android");

  const setupAndroidBiometryHeaderText = i18n.t(
    "biometry.setupandroidbiometryheader"
  );
  const setupAndroidBiometryConfirmtext = i18n.t(
    "biometry.setupandroidbiometryconfirm"
  );
  const setupAndroidBiometryCanceltext = i18n.t(
    "biometry.setupandroidbiometrycancel"
  );

  const cancelBiometryHeaderText = i18n.t("biometry.cancelbiometryheader");
  const cancelBiometryConfirmText = setupAndroidBiometryConfirmtext;

  const handlePinChange = async (digit: number) => {
    if (passcode.length < 6) {
      setPasscode(passcode + digit);
      if (originalPassCode !== "" && passcode.length === 5) {
        if (originalPassCode === passcode + digit) {
          if (biometricInfo?.strongBiometryIsAvailable) {
            if (isAndroidDevice) {
              setShowSetupAndroidBiometryAlert(true);
            } else {
              await processBiometrics();
            }
          } else {
            await handlePassAuth();
          }
        }
      }
    }
  };

  const processBiometrics = async () => {
    const isBiometricAuthenticated = await handleBiometricAuth();
    if (isBiometricAuthenticated === true) {
      await Agent.agent.basicStorage.createOrUpdateBasicRecord(
        new BasicRecord({
          id: MiscRecordId.APP_BIOMETRY,
          content: { enabled: true },
        })
      );
      dispatch(setEnableBiometryCache(true));
      dispatch(
        setToastMsg(ToastMsgType.SETUP_BIOMETRIC_AUTHENTICATION_SUCCESS)
      );
      await handlePassAuth();
    } else {
      if (isBiometricAuthenticated instanceof BiometryError) {
        if (
          isBiometricAuthenticated.code === BiometryErrorType.userCancel ||
          isBiometricAuthenticated.code ===
            BiometryErrorType.biometryNotAvailable
        ) {
          setShowCancelBiometryAlert(true);
        }
      }
    }
  };

  const handlePassAuth = async () => {
    await SecureStorage.set(KeyStoreKeys.APP_PASSCODE, originalPassCode);
    onCreateSuccess();
  };

  const handleSetupAndroidBiometry = async () => {
    await processBiometrics();
  };

  const handleCancelSetupAndroidBiometry = async () => {
    setShowCancelBiometryAlert(true);
  };

  const handleCancelBiometry = async () => {
    await handlePassAuth();
  };

  const handleRemove = () => {
    if (passcode.length >= 1) {
      setPasscode(passcode.substring(0, passcode.length - 1));
    }
  };

  const handleClearState = () => {
    setPasscode("");
    setOriginalPassCode("");
    setShowCancelBiometryAlert(false);
    setShowSetupAndroidBiometryAlert(false);
  };

  useImperativeHandle(ref, () => ({
    clearState: handleClearState,
  }));

  useEffect(() => {
    onPasscodeChange?.(passcode, originalPassCode);

    if (passcode.length === 6 && originalPassCode === "") {
      setOriginalPassCode(passcode);
      setPasscode("");
    }
  }, [originalPassCode, passcode]);

  return (
    <div className="create-passcode-module">
      {title && (
        <h2
          className="set-passcode-title"
          data-testid={`${testId}-title`}
        >
          {title}
        </h2>
      )}
      {description && (
        <p
          className="set-passcode-description small-hide"
          data-testid="set-passcode-description"
        >
          {description}
        </p>
      )}
      <PasscodeModule
        error={
          <ErrorMessage
            message={
              originalPassCode !== "" &&
              passcode.length === 6 &&
              originalPassCode !== passcode
                ? `${i18n.t("setpasscode.enterpasscode.error")}`
                : undefined
            }
            timeout={true}
          />
        }
        passcode={passcode}
        handlePinChange={handlePinChange}
        handleRemove={handleRemove}
      />
      {originalPassCode !== "" ? (
        <PageFooter
          pageId={testId}
          secondaryButtonText={`${i18n.t("setpasscode.cantremember.label")}`}
          secondaryButtonAction={() => handleClearState()}
        />
      ) : (
        <div
          className="forgot-your-passcode-placeholder"
          data-testid="forgot-your-passcode-placeholder"
        />
      )}
      <Alert
        isOpen={showSetupAndroidBiometryAlert}
        setIsOpen={setShowSetupAndroidBiometryAlert}
        dataTestId="alert-setup-android-biometry"
        headerText={setupAndroidBiometryHeaderText}
        confirmButtonText={setupAndroidBiometryConfirmtext}
        cancelButtonText={setupAndroidBiometryCanceltext}
        actionConfirm={handleSetupAndroidBiometry}
        actionCancel={handleCancelSetupAndroidBiometry}
        backdropDismiss={false}
      />
      <Alert
        isOpen={showCancelBiometryAlert}
        setIsOpen={setShowCancelBiometryAlert}
        dataTestId="alert-cancel-biometry"
        headerText={cancelBiometryHeaderText}
        confirmButtonText={cancelBiometryConfirmText}
        actionConfirm={handleCancelBiometry}
        backdropDismiss={false}
      />
    </div>
  );
});

export { CreatePasscodeModule };
