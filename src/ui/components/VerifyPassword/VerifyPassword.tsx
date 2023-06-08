import { IonButton, IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { useEffect, useState } from "react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { VerifyPasswordProps } from "./VerifyPassword.types";
import { CustomInput } from "../CustomInput";
import { ErrorMessage, MESSAGE_MILLISECONDS } from "../ErrorMessage";
import "./VerifyPassword.scss";
import { Alert } from "../Alert";
import {
  KeyStoreKeys,
  SecureStorage,
} from "../../../core/storage/secureStorage";

const VerifyPassword = ({
  modalIsOpen,
  setModalIsOpen,
}: VerifyPasswordProps) => {
  const [verifyPasswordValue, setVerifyPasswordValue] = useState("");
  const [attempts, setAttempts] = useState(6);
  const [alertChoiceIsOpen, setAlertChoiceIsOpen] = useState(false);
  const [alertHintIsOpen, setAlertHintIsOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");
  const [storedHint, setStoredHint] = useState("");

  const errorMessages = {
    hasNoMatch: i18n.t("verifypassword.error.hasNoMatch"),
  };

  const handleFetchStoredValues = async () => {
    const password = await SecureStorage.get(KeyStoreKeys.APP_OP_PASSWORD);
    if (password) {
      setStoredPassword(`${password}`);
    }
  };

  const resetModal = () => {
    setModalIsOpen(false);
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
      // @TODO - sdisalvo: navigate the user to the required page
    }
  }, [attempts]);

  const handleReset = () => {
    resetModal();
    // @TODO - sdisalvo: navigate the user to the Reset Operations Password Screen
  };

  return (
    <IonModal
      isOpen={modalIsOpen}
      initialBreakpoint={0.5}
      breakpoints={[0.5]}
      className="page-layout"
      data-testid="verify-password"
      onDidDismiss={() => resetModal()}
    >
      <div className="verify-password modal">
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonLabel={`${i18n.t("verifypassword.cancel")}`}
          closeButtonAction={() => setModalIsOpen(false)}
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
