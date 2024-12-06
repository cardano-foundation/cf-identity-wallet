import { IonButton } from "@ionic/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { i18n } from "../../../i18n";
import { Alert } from "../Alert";
import { CustomInput } from "../CustomInput";
import { ErrorMessage, MESSAGE_MILLISECONDS } from "../ErrorMessage";
import { ForgotAuthInfo } from "../ForgotAuthInfo";
import { ForgotType } from "../ForgotAuthInfo/ForgotAuthInfo.types";
import { OptionModal } from "../OptionsModal";
import "./VerifyPassword.scss";
import { VerifyPasswordProps } from "./VerifyPassword.types";
import { showError as showErrorMessage } from "../../utils/error";
import { useAppDispatch } from "../../../store/hooks";

const VerifyPassword = ({
  isOpen,
  setIsOpen,
  onVerify,
}: VerifyPasswordProps) => {
  const dispatch = useAppDispatch();
  const [verifyPasswordValue, setVerifyPasswordValue] = useState("");
  const [attempts, setAttempts] = useState(6);
  const [alertChoiceIsOpen, setAlertChoiceIsOpen] = useState(false);
  const [alertHintIsOpen, setAlertHintIsOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [storedPassword, setStoredPassword] = useState("");
  const [storedHint, setStoredHint] = useState("");
  const [openRecoveryAuth, setOpenRecoveryAuth] = useState(false);

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

  const handleFetchStoredValues = useCallback(async () => {
    if (!isOpen) return;

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
        showErrorMessage("Unable to get password", e, dispatch);
        throw e;
      }
    }

    let hint;
    try {
      hint = (
        await Agent.agent.basicStorage.findById(MiscRecordId.OP_PASS_HINT)
      )?.content?.value;
    } catch (error) {
      showErrorMessage("Unable to find password hint", error, dispatch);
    }

    setStoredHint(`${hint || ""}`);
  }, [isOpen, dispatch]);

  const resetModal = () => {
    setIsOpen(false);
    setVerifyPasswordValue("");
  };

  useEffect(() => {
    handleFetchStoredValues();
  }, [handleFetchStoredValues]);

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
      resetModal();
      onVerify();
    }
  }, [attempts]);

  const handleRecoveryPassword = () => {
    setOpenRecoveryAuth(true);
  };

  const headerOptions = useMemo(
    () => ({
      closeButton: true,
      closeButtonLabel: `${i18n.t("verifypassword.cancel")}`,
      closeButtonAction: () => setIsOpen(false, true),
      title: `${i18n.t("verifypassword.title")}`,
      actionButton: true,
      actionButtonDisabled: !verifyPasswordValue.length,
      actionButtonAction: () => setAttempts(attempts - 1),
      actionButtonLabel: `${i18n.t("verifypassword.confirm")}`,
    }),
    [attempts, setIsOpen, verifyPasswordValue.length]
  );

  const handleDissmissShowHint = () => {
    setAlertHintIsOpen(false);
  };

  const handleDissmissForgotPassword = () => {
    setAlertChoiceIsOpen(false);
  };

  const handleShowHint = () => {
    setAlertChoiceIsOpen(false);
    setAlertHintIsOpen(true);
  };

  return (
    <>
      <OptionModal
        modalIsOpen={isOpen}
        componentId="verify-password"
        customClasses="verify-password-modal"
        onDismiss={() => resetModal()}
        header={headerOptions}
      >
        <form className="password-input-container">
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
        </form>
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
              data-testid="reset-password"
              onClick={handleRecoveryPassword}
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
        secondaryConfirmButtonText={`${i18n.t(
          "verifypassword.alert.button.resetmypassword"
        )}`}
        actionConfirm={handleShowHint}
        actionSecondaryConfirm={handleRecoveryPassword}
        actionDismiss={handleDissmissForgotPassword}
      />
      <Alert
        isOpen={alertHintIsOpen}
        setIsOpen={setAlertHintIsOpen}
        dataTestId="alert-tryagain"
        headerText={i18n.t("verifypassword.alert.hint.title")}
        subheaderText={storedHint}
        confirmButtonText={`${i18n.t("verifypassword.alert.button.tryagain")}`}
        secondaryConfirmButtonText={`${i18n.t(
          "verifypassword.alert.button.resetmypassword"
        )}`}
        actionSecondaryConfirm={handleRecoveryPassword}
        actionConfirm={handleDissmissShowHint}
        actionDismiss={handleDissmissShowHint}
      />
      <ForgotAuthInfo
        isOpen={openRecoveryAuth}
        onClose={(shouldCloseParent) => {
          setOpenRecoveryAuth(false);
          if (shouldCloseParent) {
            resetModal();
          }
        }}
        type={ForgotType.Password}
      />
    </>
  );
};

export { VerifyPassword };
