import { IonButton, IonCol, IonGrid, IonModal, IonRow } from "@ionic/react";
import { useEffect, useState } from "react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { VerifyPasswordProps } from "./VerifyPassword.types";
import { CustomInput } from "../CustomInput";
import { ErrorMessage, MESSAGE_MILLISECONDS } from "../ErrorMessage";
import "./VerifyPassword.scss";
import { Alert } from "../Alert";

const VerifyPassword = ({
  modalIsOpen,
  setModalIsOpen,
}: VerifyPasswordProps) => {
  const [verifyPasswordValue, setVerifyPasswordValue] = useState("");
  const [verifyPasswordFocus, setVerifyPasswordFocus] = useState(false);
  const [attempts, setAttempts] = useState(6);
  const [alertChoiceIsOpen, setAlertChoiceIsOpen] = useState(false);
  const [alertHintIsOpen, setAlertHintIsOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const storedPassword = "Cardano1$";
  const storedHint = "Hello darkness my old friend";
  const errorMessages = {
    hasNoMatch: i18n.t("verifypassword.error.hasNoMatch"),
  };

  useEffect(() => {
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
      // TODO: navigate the user to whatever page thy need
    }
  }, [attempts]);

  const handleReset = () => {
    // TODO: navigate the user to the Reset Operations Password Screen
  };

  return (
    <IonModal
      isOpen={modalIsOpen}
      initialBreakpoint={0.5}
      breakpoints={[0.5]}
      className="page-layout"
      onDidDismiss={() => setModalIsOpen(false)}
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
                  onChangeFocus={setVerifyPasswordFocus}
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
