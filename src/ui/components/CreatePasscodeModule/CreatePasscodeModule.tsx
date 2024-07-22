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
import { setEnableBiometricsCache } from "../../../store/reducers/biometricsCache";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { useBiometricAuth } from "../../hooks/useBiometricsHook";
import { Alert } from "../Alert";
import { ErrorMessage, MESSAGE_MILLISECONDS } from "../ErrorMessage";
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
>(
  (
    {
      testId,
      title,
      description,
      overrideAlertZIndex,
      onCreateSuccess,
      onPasscodeChange,
    },
    ref
  ) => {
    const dispatch = useAppDispatch();
    const [passcode, setPasscode] = useState("");
    const [passcodeMatch, setPasscodeMatch] = useState(false);
    const [
      showSetupAndroidBiometricsAlert,
      setShowSetupAndroidBiometricsAlert,
    ] = useState(false);
    const [showCancelBiometricsAlert, setShowCancelBiometricsAlert] =
      useState(false);
    const [originalPassCode, setOriginalPassCode] = useState("");
    const { handleBiometricAuth, biometricInfo } = useBiometricAuth();
    const isAndroidDevice = getPlatforms().includes("android");

    const setupAndroidBiometricsHeaderText = i18n.t(
      "biometry.setupandroidbiometryheader"
    );
    const setupAndroidBiometricsConfirmtext = i18n.t(
      "biometry.setupandroidbiometryconfirm"
    );
    const setupAndroidBiometricsCanceltext = i18n.t(
      "biometry.setupandroidbiometrycancel"
    );

    const alertClasses = overrideAlertZIndex ? "max-zindex" : undefined;
    const cancelBiometricsHeaderText = i18n.t("biometry.cancelbiometryheader");
    const cancelBiometricsConfirmText = setupAndroidBiometricsConfirmtext;

    const verifyPasscode = async (pass: string) => {
      try {
        const storedPass = (await SecureStorage.get(
          KeyStoreKeys.APP_PASSCODE
        )) as string;
        if (!storedPass) return false;
        return storedPass === pass;
      } catch (e) {
        return false;
      }
    };

    useEffect(() => {
      if (passcodeMatch) {
        setTimeout(() => {
          setPasscodeMatch(false);
        }, MESSAGE_MILLISECONDS);
      }
    }, [passcodeMatch]);

    const handlePinChange = async (digit: number) => {
      if (passcode.length < 6) {
        setPasscode(passcode + digit);
        if (originalPassCode !== "" && passcode.length === 5) {
          if (originalPassCode === passcode + digit) {
            if (biometricInfo?.strongBiometryIsAvailable) {
              if (isAndroidDevice) {
                setShowSetupAndroidBiometricsAlert(true);
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
        dispatch(setEnableBiometricsCache(true));
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
            setShowCancelBiometricsAlert(true);
          }
        }
      }
    };

    const handlePassAuth = async () => {
      await SecureStorage.set(KeyStoreKeys.APP_PASSCODE, originalPassCode);
      onCreateSuccess();
    };

    const handleSetupAndroidBiometrics = async () => {
      await processBiometrics();
    };

    const handleCancelSetupAndroidBiometrics = async () => {
      setShowCancelBiometricsAlert(true);
    };

    const handleCancelBiometrics = async () => {
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
      setShowCancelBiometricsAlert(false);
      setShowSetupAndroidBiometricsAlert(false);
    };

    useImperativeHandle(ref, () => ({
      clearState: handleClearState,
    }));

    useEffect(() => {
      onPasscodeChange?.(passcode, originalPassCode);

      if (passcode.length === 6 && originalPassCode === "") {
        verifyPasscode(passcode).then((match) => {
          if (match) {
            setPasscodeMatch(true);
            setTimeout(() => {
              setPasscode("");
            }, MESSAGE_MILLISECONDS);
          } else {
            setOriginalPassCode(passcode);
            setPasscode("");
          }
        });
      }
    }, [originalPassCode, passcode]);

    const errorMessage = () => {
      if (passcodeMatch) {
        return i18n.t("createpasscodemodule.errormatch");
      } else if (
        originalPassCode !== "" &&
        passcode.length === 6 &&
        originalPassCode !== passcode
      ) {
        setTimeout(() => {
          setPasscode("");
        }, MESSAGE_MILLISECONDS);
        return i18n.t("createpasscodemodule.errornomatch");
      }
      return undefined;
    };

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
              message={errorMessage()}
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
            secondaryButtonText={`${i18n.t(
              "createpasscodemodule.cantremember"
            )}`}
            secondaryButtonAction={() => handleClearState()}
          />
        ) : (
          <div
            className="forgot-your-passcode-placeholder"
            data-testid="forgot-your-passcode-placeholder"
          />
        )}
        <Alert
          isOpen={showSetupAndroidBiometricsAlert}
          setIsOpen={setShowSetupAndroidBiometricsAlert}
          dataTestId="alert-setup-android-biometry"
          headerText={setupAndroidBiometricsHeaderText}
          confirmButtonText={setupAndroidBiometricsConfirmtext}
          cancelButtonText={setupAndroidBiometricsCanceltext}
          actionConfirm={handleSetupAndroidBiometrics}
          actionCancel={handleCancelSetupAndroidBiometrics}
          backdropDismiss={false}
          className={alertClasses}
        />
        <Alert
          isOpen={showCancelBiometricsAlert}
          setIsOpen={setShowCancelBiometricsAlert}
          dataTestId="alert-cancel-biometry"
          headerText={cancelBiometricsHeaderText}
          confirmButtonText={cancelBiometricsConfirmText}
          actionConfirm={handleCancelBiometrics}
          backdropDismiss={false}
          className={alertClasses}
        />
      </div>
    );
  }
);

export { CreatePasscodeModule };
