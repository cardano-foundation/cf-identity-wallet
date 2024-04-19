import { useState } from "react";
import { IonModal } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { ErrorMessage } from "../ErrorMessage";
import { PasscodeModule } from "../PasscodeModule";
import { Alert } from "../Alert";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setAuthentication,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { RoutePath } from "../../../routes";
import { VerifyPasscodeProps } from "./VerifyPasscode.types";
import "./VerifyPasscode.scss";
import { ResponsivePageLayout } from "../layout/ResponsivePageLayout";
import { PageFooter } from "../PageFooter";
import { PageHeader } from "../PageHeader";
import { useAppIonRouter } from "../../hooks";

const VerifyPasscode = ({
  isOpen,
  setIsOpen,
  onVerify,
}: VerifyPasscodeProps) => {
  const componentId = "verify-passcode";
  const ionRouter = useAppIonRouter();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const [passcode, setPasscode] = useState("");
  const seedPhrase = localStorage.getItem("seedPhrase");
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [passcodeIncorrect, setPasscodeIncorrect] = useState(false);
  const headerText =
    seedPhrase !== null
      ? i18n.t("verifypasscode.alert.text.verify")
      : i18n.t("verifypasscode.alert.text.restart");
  const confirmButtonText =
    seedPhrase !== null
      ? i18n.t("verifypasscode.alert.button.verify")
      : i18n.t("verifypasscode.alert.button.restart");
  const cancelButtonText = i18n.t("verifypasscode.alert.button.cancel");

  const handleClearState = () => {
    setPasscode("");
    setAlertIsOpen(false);
    setPasscodeIncorrect(false);
    setIsOpen(false);
  };

  const handlePinChange = (digit: number) => {
    if (passcode.length < 6) {
      setPasscode(passcode + digit);
      if (passcode.length === 5) {
        verifyPasscode(passcode + digit)
          .then((verified) => {
            if (verified) {
              onVerify();
              handleClearState();
            } else {
              setPasscodeIncorrect(true);
            }
          })
          .catch((e) => e.code === -35 && setPasscodeIncorrect(true));
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
      ionRouter.push(RoutePath.SET_PASSCODE);
      handleClearState();
    });
  };

  return (
    <IonModal
      isOpen={isOpen}
      className={componentId}
      data-testid={componentId}
      onDidDismiss={() => handleClearState()}
    >
      <ResponsivePageLayout
        header={
          <PageHeader
            closeButton={true}
            closeButtonLabel={`${i18n.t("verifypasscode.cancel")}`}
            closeButtonAction={handleClearState}
          />
        }
        pageId={`${componentId}-content`}
      >
        <h2
          className="verify-passcode-title"
          data-testid="verify-passcode-title"
        >
          {i18n.t("verifypasscode.title")}
        </h2>
        <p
          className="verify-passcode-description small-hide"
          data-testid="verify-passcode-description"
        >
          {i18n.t("verifypasscode.description")}
        </p>
        <PasscodeModule
          error={
            <ErrorMessage
              message={
                passcode.length === 6 && passcodeIncorrect
                  ? `${i18n.t("verifypasscode.error")}`
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
          secondaryButtonText={`${i18n.t("verifypasscode.forgotten.button")}`}
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

export { VerifyPasscode };
