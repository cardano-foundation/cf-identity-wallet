import { useState } from "react";
import { IonButton, IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import { ErrorMessage } from "../../components/ErrorMessage";
import { PasscodeModule } from "../../components/PasscodeModule";
import { Alert } from "../../components/Alert";
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

const VerifyPasscode = ({
  isOpen,
  setIsOpen,
  onVerify,
}: VerifyPasscodeProps) => {
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
      history.push(RoutePath.SET_PASSCODE);
      handleClearState();
    });
  };

  return (
    <IonModal
      isOpen={isOpen}
      className="page-layout verify-passcode"
      data-testid="verify-passcode"
      onDidDismiss={() => handleClearState()}
    >
      <PageLayout
        header={true}
        closeButton={true}
        closeButtonLabel={`${i18n.t("verifypasscode.cancel")}`}
        closeButtonAction={() => handleClearState()}
      >
        <PasscodeModule
          title={i18n.t("verifypasscode.title")}
          description={i18n.t("verifypasscode.description")}
          error={
            passcode.length === 6 &&
            passcodeIncorrect && (
              <ErrorMessage
                message={`${i18n.t("verifypasscode.error")}`}
                timeout={true}
              />
            )
          }
          passcode={passcode}
          handlePinChange={handlePinChange}
          handleRemove={handleRemove}
        />
        <IonGrid>
          <IonRow>
            <IonCol className="continue-col">
              <IonButton
                shape="round"
                expand="block"
                fill="outline"
                className="secondary-button"
                onClick={() => setAlertIsOpen(true)}
              >
                {i18n.t("verifypasscode.forgotten.button")}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          dataTestId="alert-forgotten"
          headerText={headerText}
          confirmButtonText={confirmButtonText}
          cancelButtonText={cancelButtonText}
          actionConfirm={resetPasscode}
        />
      </PageLayout>
    </IonModal>
  );
};

export { VerifyPasscode };
