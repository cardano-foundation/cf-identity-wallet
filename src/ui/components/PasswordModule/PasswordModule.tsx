import { forwardRef, useImperativeHandle, useState } from "react";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { i18n } from "../../../i18n";
import { passwordStrengthChecker } from "../../utils/passwordStrengthChecker";
import { Alert } from "../Alert";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import { PageFooter } from "../PageFooter";
import { PasswordValidation } from "../PasswordValidation";
import "./PasswordModule.scss";
import { PasswordModuleProps, PasswordModuleRef } from "./PasswordModule.types";

const PasswordModule = forwardRef<PasswordModuleRef, PasswordModuleProps>(
  ({ title, isModal, description, testId, onCreateSuccess }, ref) => {
    const [createPasswordValue, setCreatePasswordValue] = useState("");
    const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
    const [createPasswordFocus, setCreatePasswordFocus] = useState(false);
    const [hintValue, setHintValue] = useState("");
    const [alertIsOpen, setAlertIsOpen] = useState(false);
    const createPasswordValueMatching =
      createPasswordValue.length > 0 &&
      confirmPasswordValue.length > 0 &&
      createPasswordValue === confirmPasswordValue;
    const createPasswordValueNotMatching =
      createPasswordValue.length > 0 &&
      confirmPasswordValue.length > 0 &&
      createPasswordValue !== confirmPasswordValue;
    const validated =
      passwordStrengthChecker.validatePassword(createPasswordValue) &&
      createPasswordValueMatching &&
      hintValue !== createPasswordValue;

    const handlePasswordInput = (password: string) => {
      setCreatePasswordValue(password);
    };

    const handleClearState = () => {
      setCreatePasswordValue("");
      setConfirmPasswordValue("");
      setHintValue("");
    };

    useImperativeHandle(ref, () => ({
      clearState: handleClearState,
    }));

    const handleContinue = async (skipped: boolean) => {
      if (!skipped) {
        await SecureStorage.set(
          KeyStoreKeys.APP_OP_PASSWORD,
          createPasswordValue
        );
        if (hintValue) {
          await Agent.agent.basicStorage.createOrUpdateBasicRecord(
            new BasicRecord({
              id: MiscRecordId.OP_PASS_HINT,
              content: { value: hintValue },
            })
          );
        }
      } else {
        await Agent.agent.basicStorage.createOrUpdateBasicRecord(
          new BasicRecord({
            id: MiscRecordId.APP_PASSWORD_SKIPPED,
            content: { value: skipped },
          })
        );
      }

      onCreateSuccess(skipped);
      handleClearState();
    };

    return (
      <>
        <div className="password-module">
          <div className="page-content">
            {title && <h2 data-testid={`${testId}-title`}>{title}</h2>}
            {description && (
              <p
                className="page-paragraph"
                data-testid={`${testId}-top-paragraph`}
              >
                {description}
              </p>
            )}
            <CustomInput
              dataTestId="createPasswordValue"
              title={`${i18n.t("createpassword.input.first.title")}`}
              placeholder={`${i18n.t(
                "createpassword.input.first.placeholder"
              )}`}
              hiddenInput={true}
              onChangeInput={(password: string) =>
                handlePasswordInput(password)
              }
              onChangeFocus={setCreatePasswordFocus}
              value={createPasswordValue}
              error={
                !createPasswordFocus &&
                !!createPasswordValue.length &&
                (!passwordStrengthChecker.validatePassword(
                  createPasswordValue
                ) ||
                  !passwordStrengthChecker.isValidCharacters(
                    createPasswordValue
                  ))
              }
            />
            {createPasswordValue && (
              <PasswordValidation password={createPasswordValue} />
            )}
            <CustomInput
              dataTestId="confirm-password-value"
              title={`${i18n.t("createpassword.input.second.title")}`}
              placeholder={`${i18n.t(
                "createpassword.input.second.placeholder"
              )}`}
              hiddenInput={true}
              onChangeInput={setConfirmPasswordValue}
              onChangeFocus={setConfirmPasswordFocus}
              value={confirmPasswordValue}
              error={
                !confirmPasswordFocus &&
                !!confirmPasswordValue.length &&
                createPasswordValueNotMatching
              }
            />
            {!confirmPasswordFocus &&
              !!confirmPasswordValue.length &&
              createPasswordValueNotMatching && (
              <ErrorMessage
                message={`${i18n.t("createpassword.error.hasNoMatch")}`}
              />
            )}
            <CustomInput
              dataTestId="hintValue"
              title={`${i18n.t("createpassword.input.third.title")}`}
              placeholder={`${i18n.t(
                "createpassword.input.third.placeholder"
              )}`}
              onChangeInput={setHintValue}
              optional={true}
              value={hintValue}
              error={!!hintValue.length && hintValue === createPasswordValue}
            />
            {!!hintValue.length && hintValue === createPasswordValue && (
              <ErrorMessage
                message={`${i18n.t("createpassword.error.hintSameAsPassword")}`}
              />
            )}
          </div>
          <PageFooter
            pageId={testId}
            primaryButtonText={`${i18n.t("createpassword.button.continue")}`}
            primaryButtonAction={() => handleContinue(false)}
            primaryButtonDisabled={!validated}
            tertiaryButtonText={
              isModal ? undefined : `${i18n.t("createpassword.button.skip")}`
            }
            tertiaryButtonAction={() => setAlertIsOpen(true)}
          />
        </div>
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          dataTestId="create-password-alert-skip"
          headerText={`${i18n.t("createpassword.alert.text")}`}
          confirmButtonText={`${i18n.t("createpassword.alert.button.confirm")}`}
          cancelButtonText={`${i18n.t("createpassword.alert.button.cancel")}`}
          actionConfirm={() => handleContinue(true)}
        />
      </>
    );
  }
);

export { PasswordModule };
