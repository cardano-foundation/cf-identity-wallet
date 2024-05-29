import { useEffect, useState } from "react";
import { i18n } from "../../../i18n";
import { ErrorMessage } from "../../components/ErrorMessage";
import { SecureStorage, KeyStoreKeys } from "../../../core/storage";
import { PasscodeModule } from "../../components/PasscodeModule";
import {
  getStateCache,
  setInitialized,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { RoutePath } from "../../../routes";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { PageHeader } from "../../components/PageHeader";
import "./SetPasscode.scss";
import { PageFooter } from "../../components/PageFooter";
import { useAppIonRouter } from "../../hooks";
import { BiometryErrorType } from "@aparajita/capacitor-biometric-auth";
import { BiometryError } from "@aparajita/capacitor-biometric-auth/dist/esm/definitions";
import { getPlatforms } from "@ionic/react";
import { Alert } from "../../components/Alert";
import { useBiometricAuth } from "../../hooks/useBiometricsHook";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { setEnableBiometryCache } from "../../../store/reducers/biometryCache";
import { ToastMsgType } from "../../globals/types";

const SetPasscode = () => {
  const pageId = "set-passcode";
  const ionRouter = useAppIonRouter();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
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
    const data: DataProps = {
      store: { stateCache },
    };
    const { nextPath, updateRedux } = getNextRoute(
      RoutePath.SET_PASSCODE,
      data
    );
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    ionRouter.push(nextPath.pathname, "forward", "push");
    handleClearState();

    await Agent.agent.basicStorage.createOrUpdateBasicRecord(
      new BasicRecord({
        id: MiscRecordId.APP_ALREADY_INIT,
        content: { initialized: true },
      })
    );
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

  const handleBeforeBack = () => {
    handleClearState();
  };

  useEffect(() => {
    if (passcode.length === 6 && originalPassCode === "") {
      setOriginalPassCode(passcode);
      setPasscode("");
    }
  }, [originalPassCode, passcode]);

  const isOnReenterPasscodeStep =
    originalPassCode.length > 0 && passcode.length < 6;

  return (
    <ResponsivePageLayout
      pageId={pageId}
      header={
        <PageHeader
          backButton={true}
          onBack={isOnReenterPasscodeStep ? handleClearState : undefined}
          beforeBack={handleBeforeBack}
          currentPath={RoutePath.SET_PASSCODE}
          progressBar={true}
          progressBarValue={0.25}
          progressBarBuffer={1}
        />
      }
    >
      <h2
        className="set-passcode-title"
        data-testid={`${pageId}-title`}
      >
        {originalPassCode !== ""
          ? i18n.t("setpasscode.reenterpasscode.title")
          : i18n.t("setpasscode.enterpasscode.title")}
      </h2>
      <p
        className="set-passcode-description small-hide"
        data-testid="set-passcode-description"
      >
        {i18n.t("setpasscode.enterpasscode.description")}
      </p>
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
          pageId={pageId}
          secondaryButtonText={`${i18n.t("setpasscode.startover.label")}`}
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
    </ResponsivePageLayout>
  );
};

export { SetPasscode };
