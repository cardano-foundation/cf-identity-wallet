import { App, AppState } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import i18n from "i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { PublicRoutes, RoutePath } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getBiometricsCacheCache } from "../../../store/reducers/biometricsCache";
import {
  geFirstAppLaunch,
  getAuthentication,
  getCurrentRoute,
  login,
  setFirstAppLaunch,
} from "../../../store/reducers/stateCache";
import { Alert } from "../../components/Alert";
import {
  ErrorMessage,
  MESSAGE_MILLISECONDS,
} from "../../components/ErrorMessage";
import { ForgotAuthInfo } from "../../components/ForgotAuthInfo";
import { ForgotType } from "../../components/ForgotAuthInfo/ForgotAuthInfo.types";
import {
  MaxLoginAttemptAlert,
  useLoginAttempt,
} from "../../components/MaxLoginAttemptAlert";
import { PageFooter } from "../../components/PageFooter";
import { PasscodeModule } from "../../components/PasscodeModule";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { BackEventPriorityType } from "../../globals/types";
import { useExitAppWithDoubleTap } from "../../hooks/exitAppWithDoubleTapHook";
import { usePrivacyScreen } from "../../hooks/privacyScreenHook";
import { useBiometricAuth } from "../../hooks/useBiometricsHook";
import { showError } from "../../utils/error";
import "./LockPage.scss";

const LockPageContainer = () => {
  const pageId = "lock-page";
  const dispatch = useAppDispatch();
  const [passcode, setPasscode] = useState("");
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [passcodeIncorrect, setPasscodeIncorrect] = useState(false);
  const { handleBiometricAuth } = useBiometricAuth();
  const biometricsCache = useSelector(getBiometricsCacheCache);
  const firstAppLaunch = useSelector(geFirstAppLaunch);
  const [openRecoveryAuth, setOpenRecoveryAuth] = useState(false);
  const { enablePrivacy, disablePrivacy } = usePrivacyScreen();

  const {
    isLock,
    lockDuration,
    errorMessage,
    incrementLoginAttempt,
    resetLoginAttempt,
  } = useLoginAttempt();

  useExitAppWithDoubleTap(
    alertIsOpen || openRecoveryAuth,
    BackEventPriorityType.LockPage
  );

  const headerText = i18n.t("lockpage.alert.text.verify");
  const confirmButtonText = i18n.t("lockpage.alert.button.verify");
  const cancelButtonText = i18n.t("lockpage.alert.button.cancel");

  const handleClearState = () => {
    setAlertIsOpen(false);
    setPasscodeIncorrect(false);
    setPasscode("");
  };

  useEffect(() => {
    if (passcodeIncorrect) {
      setTimeout(() => {
        setPasscodeIncorrect(false);
        setPasscode("");
      }, MESSAGE_MILLISECONDS);
    }
  }, [passcodeIncorrect]);

  const handleBiometrics = useCallback(async () => {
    disablePrivacy();
    const isAuthenticated = await handleBiometricAuth();
    if (isAuthenticated === true) {
      dispatch(login());
      dispatch(setFirstAppLaunch(false));
    }
    enablePrivacy();
  }, [disablePrivacy, dispatch, enablePrivacy, handleBiometricAuth]);

  const handleUseBiometrics = useCallback(async () => {
    if (biometricsCache.enabled) {
      await handleBiometrics();
    }
  }, [biometricsCache.enabled, handleBiometrics]);

  useEffect(() => {
    if (firstAppLaunch) {
      handleUseBiometrics();
    }
  }, [firstAppLaunch, handleUseBiometrics]);

  const handlePinChange = async (digit: number) => {
    const updatedPasscode = `${passcode}${digit}`;

    if (updatedPasscode.length <= 6) setPasscode(updatedPasscode);

    if (updatedPasscode.length === 6) {
      const verified = await verifyPasscode(updatedPasscode);

      if (verified) {
        await resetLoginAttempt();
        dispatch(login());
        dispatch(setFirstAppLaunch(false));
        handleClearState();
      } else {
        await incrementLoginAttempt();
        setPasscodeIncorrect(true);
      }
    }
  };

  const handleRemove = () => {
    if (passcode.length >= 1) {
      setPasscode(passcode.substring(0, passcode.length - 1));
    }
  };

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

  const resetPasscode = () => {
    setOpenRecoveryAuth(true);
  };

  const error = useMemo(() => {
    if (!passcodeIncorrect || isLock) return undefined;

    if (errorMessage) return errorMessage;

    if (passcode.length === 6) return `${i18n.t("lockpage.error")}`;

    return undefined;
  }, [errorMessage, passcode.length, passcodeIncorrect, isLock]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // NOTE: focus to passcode button when open lock page to close keyboard and unfocus any textbox
      Keyboard.hide();
      document.getElementById("passcode-button-1")?.focus();
    }
  }, []);
  
  useEffect(() => {
    const handleAppStateChange = async (state: AppState) => {
      if (state.isActive) {
        await handleUseBiometrics();
      }
    };

    const listener = App.addListener("appStateChange", handleAppStateChange);

    return () => {
      listener.then((value) => value.remove()).catch((e) => showError("Unable to clear listener", e));
    };
  }, [handleUseBiometrics]);

  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={true}
      customClass={"show animation-off max-overlay"}
    >
      {isLock ? (
        <MaxLoginAttemptAlert lockDuration={lockDuration} />
      ) : (
        <>
          <h2
            className={`${pageId}-title`}
            data-testid={`${pageId}-title`}
          >
            {i18n.t("lockpage.title")}
          </h2>
          <p
            className={`${pageId}-description small-hide`}
            data-testid={`${pageId}-description`}
          >
            {i18n.t("lockpage.description")}
          </p>
          <PasscodeModule
            error={
              <ErrorMessage
                message={error}
                timeout={true}
                key={error}
              />
            }
            hasError={!!error}
            passcode={passcode}
            handlePinChange={handlePinChange}
            handleRemove={handleRemove}
            handleBiometricButtonClick={() => {
              handleUseBiometrics();
            }}
          />
        </>
      )}
      <PageFooter
        pageId={pageId}
        secondaryButtonText={`${i18n.t("lockpage.forgotten.button")}`}
        secondaryButtonAction={() => setAlertIsOpen(true)}
      />
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-forgotten"
        headerText={headerText}
        confirmButtonText={confirmButtonText}
        cancelButtonText={cancelButtonText}
        actionConfirm={resetPasscode}
        className="alert-forgotten"
      />
      <ForgotAuthInfo
        isOpen={openRecoveryAuth}
        onClose={() => setOpenRecoveryAuth(false)}
        type={ForgotType.Passcode}
        overrideAlertZIndex
      />
    </ResponsivePageLayout>
  );
};

const LockPage = () => {
  const currentRoute = useAppSelector(getCurrentRoute);
  const authentication = useAppSelector(getAuthentication);

  const isPublicPage = PublicRoutes.includes(currentRoute?.path as RoutePath);

  if(isPublicPage || authentication.loggedIn) {
    return null;
  }

  return <LockPageContainer />
}

export { LockPage };
