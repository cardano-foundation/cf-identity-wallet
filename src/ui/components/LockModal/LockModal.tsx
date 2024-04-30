import { IonModal } from "@ionic/react";
import {
  BiometryErrorType,
  BiometryError,
  AndroidBiometryStrength,
  BiometricAuth,
  CheckBiometryResult,
} from "@aparajita/capacitor-biometric-auth";
import { useEffect, useState } from "react";
import { PluginListenerHandle } from "@capacitor/core";
import { i18n } from "../../../i18n";
import "./LockModal.scss";
import { RoutePath } from "../../../routes";
import { PasscodeModule } from "../PasscodeModule";
import { ErrorMessage, MESSAGE_MILLISECONDS } from "../ErrorMessage";
import { PageFooter } from "../PageFooter";
import { Alert } from "../Alert";
import { ResponsivePageLayout } from "../layout/ResponsivePageLayout";
import { useAppIonRouter } from "../../hooks";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  login,
  logout,
  setAuthentication,
  setCurrentRoute,
  setPauseQueueIncomingRequest,
} from "../../../store/reducers/stateCache";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { PublicRoutes } from "../../../routes/paths";
import { LockModalTypes } from "./LockModal.types";

const LockModal = ({ didEnter }: LockModalTypes) => {
  const componentId = "lock-modal";
  const ionRouter = useAppIonRouter();
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const [passcode, setPasscode] = useState("");
  const seedPhrase = authentication.seedPhraseIsSet;
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [showModalAfterRender, setShowModalAfterRender] = useState(false);
  const [passcodeIncorrect, setPasscodeIncorrect] = useState(false);
  const headerText = seedPhrase
    ? i18n.t("lockmodal.alert.text.verify")
    : i18n.t("lockmodal.alert.text.restart");
  const confirmButtonText = seedPhrase
    ? i18n.t("lockmodal.alert.button.verify")
    : i18n.t("lockmodal.alert.button.restart");
  const cancelButtonText = i18n.t("lockmodal.alert.button.cancel");

  useEffect(() => {
    didEnter && didEnter();
    setShowModalAfterRender(true);
  }, []);

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
          setTimeout(() => {
            dispatch(setPauseQueueIncomingRequest(false));
          }, 500);
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

  const isPublicPage = PublicRoutes.includes(
    window.location.pathname as RoutePath
  );
  const lockApp = !isPublicPage && !authentication.loggedIn;

  return (
    <IonModal
      isOpen={lockApp && showModalAfterRender}
      className="lock-modal"
      data-testid={componentId}
      animated={false}
    >
      <ResponsivePageLayout
        pageId={componentId}
        activeStatus={true}
      >
        <h2
          className="lock-modal-title"
          data-testid="lock-modal-title"
        >
          {i18n.t("lockmodal.title")}
        </h2>
        <p
          className="lock-modal-description small-hide"
          data-testid="lock-modal-description"
        >
          {i18n.t("lockmodal.description")}
        </p>
        <PasscodeModule
          error={
            <ErrorMessage
              message={
                passcode.length === 6 && passcodeIncorrect
                  ? `${i18n.t("lockmodal.error")}`
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
          pageId={componentId}
          secondaryButtonText={`${i18n.t("lockmodal.forgotten.button")}`}
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
    </IonModal>
  );
};

export { LockModal };
