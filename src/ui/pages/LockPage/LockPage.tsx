import i18n from "i18next";
import { useEffect, useState } from "react";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { useAppIonRouter } from "../../hooks";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  login,
  setAuthentication,
  setCurrentRoute,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import {
  ErrorMessage,
  MESSAGE_MILLISECONDS,
} from "../../components/ErrorMessage";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { RoutePath } from "../../../routes";
import { PasscodeModule } from "../../components/PasscodeModule";
import { PageFooter } from "../../components/PageFooter";
import { Alert } from "../../components/Alert";
import { useBiometricAuth } from "../../hooks/useBiometrics";

import "./LockPage.scss";
import { useActivityTimer } from "../../components/AppWrapper/hooks/useActivityTimer";
import { ToastMsgType } from "../../globals/types";

const LockPage = () => {
  const pageId = "lock-page";
  const ionRouter = useAppIonRouter();
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const [passcode, setPasscode] = useState("");
  const seedPhrase = authentication.seedPhraseIsSet;
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [passcodeIncorrect, setPasscodeIncorrect] = useState(false);
  const { handleBiometricAuth, biometricInfo } = useBiometricAuth();

  const headerText = seedPhrase
    ? i18n.t("lockpage.alert.text.verify")
    : i18n.t("lockpage.alert.text.restart");
  const confirmButtonText = seedPhrase
    ? i18n.t("lockpage.alert.button.verify")
    : i18n.t("lockpage.alert.button.restart");
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

  const handleBiometrics = async () => {
    if (biometricInfo?.strongBiometryIsAvailable) {
      const isAuthenticated = await handleBiometricAuth();
      if (isAuthenticated === true) {
        dispatch(login());
      }
    } else {
      dispatch(setToastMsg(ToastMsgType.STRONG_BIOMETRY_NOT_AVAILABLE));
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

  return (
    <ResponsivePageLayout
      pageId={pageId}
      activeStatus={true}
      customClass={"show animation-off max-overlay"}
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
        handleBiometricButtonClick={() => {
          handleBiometrics();
        }}
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
