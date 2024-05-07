import { IonButton } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { i18n } from "../../../i18n";
import { VerifyPasswordProps } from "./VerifyPassword.types";
import { CustomInput } from "../CustomInput";
import { ErrorMessage, MESSAGE_MILLISECONDS } from "../ErrorMessage";
import "./VerifyPassword.scss";
import { Alert } from "../Alert";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { OptionModal } from "../OptionsModal";

const VerifyPassword = ({
  isOpen,
  setIsOpen,
  onVerify,
}: VerifyPasswordProps) => {
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

  const errorMessages = {
    hasNoMatch: i18n.t("verifypassword.error.hasNoMatch"),
  };

  const handleFetchStoredValues = async () => {
    try {
      const password = await SecureStorage.get(KeyStoreKeys.APP_OP_PASSWORD);
      if (password) {
        setStoredPassword(`${password}`);
      }
    } catch (e) {
      if (
        !(e instanceof Error) ||
        !(
          e instanceof Error &&
          e.message ===
            `${SecureStorage.KEY_NOT_FOUND} ${KeyStoreKeys.APP_OP_PASSWORD}`
        )
      ) {
        // @TODO - sdisalvo: handle error
        throw e;
      }
    }

    let hint;
    try {
      hint = (
        await Agent.agent.basicStorage.findById(MiscRecordId.OP_PASS_HINT)
      )?.content?.value;
    } catch (error) {
      // TODO: @bao-sotatek handle error for this
    }

    if (hint) {
      setStoredHint(`${hint}`);
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
      onVerify();
    }
  }, [attempts]);

  const handleReset = () => {
    resetModal();
    // @TODO - sdisalvo: navigate the user to the Reset Operations Password Screen
  };

  const headerOptions = useMemo(
    () => ({
      closeButton: true,
      closeButtonLabel: `${i18n.t("verifypassword.cancel")}`,
      closeButtonAction: () => setIsOpen(false),
      title: `${i18n.t("verifypassword.title")}`,
      actionButton: true,
      actionButtonDisabled: !verifyPasswordValue.length,
      actionButtonAction: () => setAttempts(attempts - 1),
      actionButtonLabel: `${i18n.t("verifypassword.confirm")}`,
    }),
    [verifyPasswordValue.length]
  );

  return (
    <>
      <OptionModal
        modalIsOpen={isOpen}
        componentId="verify-password"
        customClasses="verify-password-modal"
        onDismiss={() => resetModal()}
        header={headerOptions}
      >
        <div className="password-input-container">
          <CustomInput
            dataTestId="verify-password-value"
            hiddenInput={true}
            autofocus={true}
            onChangeInput={setVerifyPasswordValue}
            value={verifyPasswordValue}
          />
          {showError ? (
            <ErrorMessage
              message={errorMessages.hasNoMatch}
              timeout={true}
            />
          ) : (
            <div className="error-placeholder" />
          )}
        </div>
        <div className="forgot-actions">
          {storedHint ? (
            <IonButton
              shape="round"
              expand="block"
              fill="outline"
              className="secondary-button"
              onClick={() => setAlertChoiceIsOpen(true)}
              data-testid="forgot-hint-btn"
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
        </div>
      </OptionModal>
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
        confirmButtonText={`${i18n.t("verifypassword.alert.button.tryagain")}`}
        cancelButtonText={`${i18n.t(
          "verifypassword.alert.button.resetmypassword"
        )}`}
        actionConfirm={() => setAlertHintIsOpen(false)}
        actionDismiss={handleReset}
      />
    </>
  );
};

export { VerifyPassword };
