import { useEffect, useState } from "react";
import { IonButton, IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { ErrorMessage } from "../ErrorMessage";
import { PasscodeModule } from "../PasscodeModule";
import { Alert } from "../Alert";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  getCurrentOperation,
  getCurrentRoute,
  getStateCache,
  setAuthentication,
  setCurrentOperation,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { RoutePath } from "../../../routes";
import { VerifyPasscodeProps } from "./VerifyPasscode.types";
import "./VerifyPasscode.scss";
import { TabsRoutePath } from "../../../routes/paths";
import { operationState, toastState } from "../../constants/dictionary";

const VerifyPasscode = ({
  isOpen,
  setIsOpen,
  onVerify,
}: VerifyPasscodeProps) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const currentOperation = useAppSelector(getCurrentOperation);
  const currentRoute = useAppSelector(getCurrentRoute);
  const [currentAction, setCurrentAction] = useState("");
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

  useEffect(() => {
    let operation = "";
    if (
      currentRoute?.path?.includes(TabsRoutePath.DIDS) &&
      currentOperation === operationState.deleteIdentity
    ) {
      operation = toastState.identityDeleted;
    } else if (
      currentRoute?.path?.includes(TabsRoutePath.CREDS) &&
      currentOperation === operationState.deleteCredential
    ) {
      operation = toastState.credentialDeleted;
    } else if (
      currentRoute?.path?.includes(RoutePath.CONNECTION_DETAILS) &&
      currentOperation === operationState.deleteConnection
    ) {
      operation = toastState.connectionDeleted;
    }
    setCurrentAction(operation);
  }, [currentRoute?.path, currentOperation]);

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
              dispatch(setCurrentOperation(currentAction));
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
        <IonGrid>
          <IonRow>
            <IonCol
              className="verify-passcode-title"
              data-testid="verify-passcode-title"
            >
              {i18n.t("verifypasscode.title")}
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol
              className="verify-passcode-description"
              data-testid="verify-passcode-description"
            >
              {i18n.t("verifypasscode.description")}
            </IonCol>
          </IonRow>
        </IonGrid>
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
