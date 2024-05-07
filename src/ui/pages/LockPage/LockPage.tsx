import i18n from "i18next";
import {
  BiometryErrorType,
  BiometryError,
  AndroidBiometryStrength,
  BiometricAuth,
  CheckBiometryResult,
} from "@aparajita/capacitor-biometric-auth";
import { useEffect, useState } from "react";
import { PluginListenerHandle } from "@capacitor/core";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { useAppIonRouter } from "../../hooks";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  login,
  setAuthentication,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import {
  ErrorMessage,
  MESSAGE_MILLISECONDS,
} from "../../components/ErrorMessage";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { RoutePath } from "../../../routes";
import { PublicRoutes } from "../../../routes/paths";
import { PasscodeModule } from "../../components/PasscodeModule";
import { PageFooter } from "../../components/PageFooter";
import { Alert } from "../../components/Alert";
import "./LockPage.scss";
import { BiometryInfo } from "./LockPage.types";

const LockPage = () => {
  const pageId = "lock-page";
  const ionRouter = useAppIonRouter();
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const [passcode, setPasscode] = useState("");
  const seedPhrase = authentication.seedPhraseIsSet;
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [passcodeIncorrect, setPasscodeIncorrect] = useState(false);
  const [biometricInfo, setBiometricInfo] = useState<BiometryInfo | undefined>(
    undefined
  );
  const headerText = seedPhrase
    ? i18n.t("lockpage.alert.text.verify")
    : i18n.t("lockpage.alert.text.restart");
  const confirmButtonText = seedPhrase
    ? i18n.t("lockpage.alert.button.verify")
    : i18n.t("lockpage.alert.button.restart");
  const cancelButtonText = i18n.t("lockpage.alert.button.cancel");

  let appListener: PluginListenerHandle;
  useEffect(() => {
    const checkBiometry = async () => {
      updateBiometryInfo(await BiometricAuth.checkBiometry());
      try {
        appListener = await BiometricAuth.addResumeListener(updateBiometryInfo);
      } catch (error) {
        if (error instanceof Error) {
          // TODO
        }
      }
    };

    checkBiometry();
    return () => {
      appListener?.remove();
    };
  }, []);

  const updateBiometryInfo = (info: CheckBiometryResult): void => {
    setBiometricInfo(info);
    if (info.isAvailable) {
      handleBiometricAuth();
    } else {
      // Biometry is not available, info.reason and info.code will tell you why.
    }
  };

  const handleBiometricAuth = async () => {
    try {
      await BiometricAuth.authenticate({
        reason: "Please authenticate",
        cancelTitle: "Cancel",
        allowDeviceCredential: true,
        iosFallbackTitle: "Use passcode",
        androidTitle: "Biometric login",
        androidSubtitle: "Log in using biometric authentication",
        androidConfirmationRequired: false,
        androidBiometryStrength: AndroidBiometryStrength.weak,
      });

      dispatch(login());
      handleClearState();
    } catch (error) {
      // error is always an instance of BiometryError.
      if (error instanceof BiometryError) {
        if (error.code !== BiometryErrorType.userCancel) {
          // Display the error.
          //await showAlert(error.message)
        }
      }
    }
  };

  const handleClearState = () => {
    setAlertIsOpen(false);
    setPasscodeIncorrect(false);
    setPasscode("");
  };

  useEffect(() => {
    if (passcodeIncorrect) {
      setTimeout(() => {
        setPasscodeIncorrect(false);
      }, MESSAGE_MILLISECONDS);
    }
  }, [passcodeIncorrect]);

  const handlePinChange = (digit: number) => {
    const updatedPasscode = `${passcode}${digit}`;

    if (updatedPasscode.length <= 6) setPasscode(updatedPasscode);

    if (updatedPasscode.length === 6) {
      verifyPasscode(updatedPasscode).then((verified) => {
        if (verified) {
          dispatch(login());
          handleClearState();
        } else {
          setPasscodeIncorrect(true);
        }
      });
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
    SecureStorage.delete(KeyStoreKeys.APP_PASSCODE).then(() => {
      dispatch(
        setAuthentication({
          ...authentication,
          passcodeIsSet: false,
        })
      );
      dispatch(
        setCurrentRoute({
          path: RoutePath.SET_PASSCODE,
        })
      );
      ionRouter.push(RoutePath.SET_PASSCODE, "back", "pop");
      handleClearState();
    });
  };

  const isPublicPage = PublicRoutes.includes(
    window.location.pathname as RoutePath
  );
  const lockApp = !isPublicPage && !authentication.loggedIn;

  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={lockApp}
      customClass={`${lockApp ? "show" : "hide"} animation-off max-overlay`}
    >
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
            message={
              passcode.length === 6 && passcodeIncorrect
                ? `${i18n.t("lockpage.error")}`
                : undefined
            }
            timeout={true}
          />
        }
        passcode={passcode}
        handlePinChange={handlePinChange}
        handleRemove={handleRemove}
      />
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
      />
    </ResponsivePageLayout>
  );
};

export { LockPage };
