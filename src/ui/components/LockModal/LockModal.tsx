import { IonModal } from "@ionic/react";
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
  setAuthentication,
  setCurrentRoute,
  setPauseQueueIncomingRequest,
} from "../../../store/reducers/stateCache";
import { useEffect, useState } from "react";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { PublicRoutes } from "../../../routes/paths";

const LockModal = () => {
  const componentId = "lock-modal";
  const ionRouter = useAppIonRouter();
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const [passcode, setPasscode] = useState("");
  const seedPhrase = authentication.seedPhraseIsSet;
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [passcodeIncorrect, setPasscodeIncorrect] = useState(false);
  const headerText = seedPhrase
    ? i18n.t("lockmodal.alert.text.verify")
    : i18n.t("lockmodal.alert.text.restart");
  const confirmButtonText = seedPhrase
    ? i18n.t("lockmodal.alert.button.verify")
    : i18n.t("lockmodal.alert.button.restart");
  const cancelButtonText = i18n.t("lockmodal.alert.button.cancel");

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

  const isPublicPage = PublicRoutes.includes(
    window.location.pathname as RoutePath
  );
  const lockApp = !isPublicPage && !authentication.loggedIn;

  return (
    <IonModal
      isOpen={lockApp}
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
