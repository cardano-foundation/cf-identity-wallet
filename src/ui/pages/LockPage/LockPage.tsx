import i18n from "i18next";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { useAppDispatch } from "../../../store/hooks";
import { getBiometricsCacheCache } from "../../../store/reducers/biometricsCache";
import { login } from "../../../store/reducers/stateCache";
import { Alert } from "../../components/Alert";
import {
  ErrorMessage,
  MESSAGE_MILLISECONDS,
} from "../../components/ErrorMessage";
import { ForgotAuthInfo } from "../../components/ForgotAuthInfo";
import { ForgotType } from "../../components/ForgotAuthInfo/ForgotAuthInfo.types";
import { PageFooter } from "../../components/PageFooter";
import { PasscodeModule } from "../../components/PasscodeModule";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { useBiometricAuth } from "../../hooks/useBiometricsHook";
import { useExitAppWithDoubleTap } from "../../hooks/useExitAppWithDoubleTap";
import "./LockPage.scss";

const LockPage = () => {
  const pageId = "lock-page";
  const dispatch = useAppDispatch();
  const [passcode, setPasscode] = useState("");
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [passcodeIncorrect, setPasscodeIncorrect] = useState(false);
  const { handleBiometricAuth } = useBiometricAuth();
  const biometricsCache = useSelector(getBiometricsCacheCache);
  const [openRecoveryAuth, setOpenRecoveryAuth] = useState(false);

  useExitAppWithDoubleTap(alertIsOpen || openRecoveryAuth);

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

  useEffect(() => {
    const runBiometrics = async () => {
      if (biometricsCache.enabled) {
        await handleBiometrics();
      }
    };
    runBiometrics();
  }, []);

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
    const isAuthenticated = await handleBiometricAuth();
    if (isAuthenticated === true) {
      dispatch(login());
    }
  };

  const resetPasscode = () => {
    setOpenRecoveryAuth(true);
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

export { LockPage };
