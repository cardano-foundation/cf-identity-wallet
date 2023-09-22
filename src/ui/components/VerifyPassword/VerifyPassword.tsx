import { IonButton, IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { useEffect, useState } from "react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { VerifyPasswordProps } from "./VerifyPassword.types";
import { CustomInput } from "../CustomInput";
import { ErrorMessage, MESSAGE_MILLISECONDS } from "../ErrorMessage";
import "./VerifyPassword.scss";
import { Alert } from "../Alert";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { AriesAgent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/modules";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCurrentOperation,
  getCurrentRoute,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { TabsRoutePath } from "../navigation/TabsMenu";
import { operationState, toastState } from "../../constants/dictionary";
import { RoutePath } from "../../../routes";

const VerifyPassword = ({
  isOpen,
  setIsOpen,
  onVerify,
}: VerifyPasswordProps) => {
  const dispatch = useAppDispatch();
  const currentOperation = useAppSelector(getCurrentOperation);
  const currentRoute = useAppSelector(getCurrentRoute);
  const [currentAction, setCurrentAction] = useState("");
  const [verifyPasswordValue, setVerifyPasswordValue] = useState("");
  const [attempts, setAttempts] = useState(6);
  const [alertChoiceIsOpen, setAlertChoiceIsOpen] = useState(false);
  const [alertHintIsOpen, setAlertHintIsOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");
  const [storedHint, setStoredHint] = useState("");

  const setFocus = () => {
    setTimeout(() => {
      const inputField = document.querySelector<HTMLElement>(
        "#verify-password-value input"
      );
      inputField?.focus();
    }, 250);
  };

  useEffect(() => {
    if (isOpen) {
      setFocus();
    }
  }, [isOpen]);

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
      currentRoute?.path?.includes(TabsRoutePath.CRYPTO) &&
      currentOperation === operationState.deleteWallet
    ) {
      operation = toastState.walletDeleted;
    } else if (
      currentRoute?.path?.includes(RoutePath.CONNECTION_DETAILS) &&
      currentOperation === operationState.deleteConnection
    ) {
      operation = toastState.connectionDeleted;
    }
    setCurrentAction(operation);
  }, [currentRoute?.path, currentOperation]);

  const errorMessages = {
    hasNoMatch: i18n.t("verifypassword.error.hasNoMatch"),
  };

  const handleFetchStoredValues = async () => {
    try {
      const password = await SecureStorage.get(KeyStoreKeys.APP_OP_PASSWORD);
      if (password) {
        setStoredPassword(`${password}`);
      }

      const hint = await AriesAgent.agent.getMiscRecordValueById(
        MiscRecordId.OP_PASS_HINT
      );
      if (hint) {
        setStoredHint(`${hint}`);
      }
    } catch (e) {
      // @TODO - sdisalvo: handle error
    }
  };

  const resetModal = () => {
    setIsOpen(false);
    setVerifyPasswordValue("");
  };

  useEffect(() => {
    handleFetchStoredValues();
  }, []);

  useEffect(() => {
    // @TODO - sdisalvo: display the available attempts remaining.
    // Display count down timer of 1 minute if available attempts is equal to 0.
    // Count down timer must be persistent if the user navigates away from the page
    // or closes the application.
    // The UI will disable password input fields during count down timer.

    if (
      verifyPasswordValue.length > 0 &&
      verifyPasswordValue !== storedPassword
    ) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, MESSAGE_MILLISECONDS * 1.5);
    }
    if (
      verifyPasswordValue.length > 0 &&
      verifyPasswordValue === storedPassword
    ) {
      resetModal();
      dispatch(setCurrentOperation(currentAction));
      onVerify();
    }
  }, [attempts]);

  const handleReset = () => {
    resetModal();
    // @TODO - sdisalvo: navigate the user to the Reset Operations Password Screen
  };

  return (
    <IonModal
      isOpen={isOpen}
      initialBreakpoint={0.35}
      breakpoints={[0, 0.35]}
      animated={false}
      className="page-layout extended-modal"
      data-testid="verify-password"
      onDidDismiss={() => resetModal()}
    >
      <div className="verify-password modal">
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonLabel={`${i18n.t("verifypassword.cancel")}`}
          closeButtonAction={() => setIsOpen(false)}
          actionButton={true}
          actionButtonDisabled={!verifyPasswordValue.length}
          actionButtonAction={() => setAttempts(attempts - 1)}
          actionButtonLabel={`${i18n.t("verifypassword.confirm")}`}
          title={`${i18n.t("verifypassword.title")}`}
        >
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <CustomInput
                  dataTestId="verify-password-value"
                  hiddenInput={true}
                  autofocus={true}
                  onChangeInput={setVerifyPasswordValue}
                  value={verifyPasswordValue}
                />
              </IonCol>
            </IonRow>
            {showError ? (
              <ErrorMessage
                message={errorMessages.hasNoMatch}
                timeout={true}
              />
            ) : (
              <div className="error-placeholder" />
            )}
          </IonGrid>
          <IonGrid>
            <IonRow>
              <IonCol className="continue-col">
                {storedHint ? (
                  <IonButton
                    shape="round"
                    expand="block"
                    fill="outline"
                    className="secondary-button"
                    onClick={() => setAlertChoiceIsOpen(true)}
                  >
                    {i18n.t("verifypassword.button.forgot")}
                  </IonButton>
                ) : (
                  <IonButton
                    shape="round"
                    expand="block"
                    fill="outline"
                    className="secondary-button"
                    onClick={handleReset}
                  >
                    {i18n.t("verifypassword.alert.button.resetmypassword")}
                  </IonButton>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
          <Alert
            isOpen={alertChoiceIsOpen}
            setIsOpen={setAlertChoiceIsOpen}
            dataTestId="alert-choice"
            headerText={i18n.t("verifypassword.alert.choice.title")}
            confirmButtonText={`${i18n.t(
              "verifypassword.alert.button.seepasswordhint"
            )}`}
            cancelButtonText={`${i18n.t(
              "verifypassword.alert.button.resetmypassword"
            )}`}
            actionConfirm={() => {
              setAlertChoiceIsOpen(false);
              setAlertHintIsOpen(true);
            }}
            actionDismiss={handleReset}
          />
          <Alert
            isOpen={alertHintIsOpen}
            setIsOpen={setAlertHintIsOpen}
            dataTestId="alert-tryagain"
            headerText={i18n.t("verifypassword.alert.hint.title")}
            subheaderText={storedHint}
            confirmButtonText={`${i18n.t(
              "verifypassword.alert.button.tryagain"
            )}`}
            cancelButtonText={`${i18n.t(
              "verifypassword.alert.button.resetmypassword"
            )}`}
            actionConfirm={() => setAlertHintIsOpen(false)}
            actionDismiss={handleReset}
          />
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { VerifyPassword };
function setCurrentAction(operation: string) {
  throw new Error("Function not implemented.");
}
