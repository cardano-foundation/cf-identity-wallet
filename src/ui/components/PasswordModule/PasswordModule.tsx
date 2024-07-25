import { forwardRef, useImperativeHandle, useState } from "react";
import { useSelector } from "react-redux";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { i18n } from "../../../i18n";
import { passwordStrengthChecker } from "../../utils/passwordStrengthChecker";
import { Alert as AlertCancel, Alert as AlertExisting } from "../Alert";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import { PageFooter } from "../PageFooter";
import { PasswordValidation } from "../PasswordValidation";
import "./PasswordModule.scss";
import { PasswordModuleProps, PasswordModuleRef } from "./PasswordModule.types";
import { getStateCache } from "../../../store/reducers/stateCache";

const PasswordModule = forwardRef<PasswordModuleRef, PasswordModuleProps>(
  ({ title, isModal, description, testId, onCreateSuccess }, ref) => {
    const stateCache = useSelector(getStateCache);
    const authentication = stateCache.authentication;
    const [createPasswordValue, setCreatePasswordValue] = useState("");
    const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
    const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
    const [createPasswordFocus, setCreatePasswordFocus] = useState(false);
    const [hintValue, setHintValue] = useState("");
    const [alertCancelIsOpen, setAlertCancelIsOpen] = useState(false);
    const [alertExistingIsOpen, setAlertExistingIsOpen] = useState(false);
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

    const handleClearExisting = () => {
      setAlertExistingIsOpen(false);
      handleClearState();
    };

    useImperativeHandle(ref, () => ({
      clearState: handleClearState,
    }));

    const handleContinue = async (skipped: boolean) => {
      if (!skipped) {
        const currentPassword = await SecureStorage.get(
          KeyStoreKeys.APP_OP_PASSWORD
        );
        if (
          isModal &&
          authentication.passcodeIsSet &&
          currentPassword === createPasswordValue
        ) {
          setAlertExistingIsOpen(true);
          return;
        } else {
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
        }
      } else {
        await SecureStorage.set(KeyStoreKeys.APP_OP_PASSWORD, "");
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
              dataTestId="create-password-input"
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
              dataTestId="confirm-password-input"
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
              dataTestId="create-hint-input"
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
            tertiaryButtonAction={() => setAlertCancelIsOpen(true)}
          />
        </div>
        <AlertCancel
          isOpen={alertCancelIsOpen}
          setIsOpen={setAlertCancelIsOpen}
          dataTestId="create-password-alert-skip"
          headerText={`${i18n.t("createpassword.alert.text")}`}
          confirmButtonText={`${i18n.t("createpassword.alert.button.confirm")}`}
          cancelButtonText={`${i18n.t("createpassword.alert.button.cancel")}`}
          actionConfirm={() => handleContinue(true)}
        />
        <AlertExisting
          isOpen={alertExistingIsOpen}
          setIsOpen={setAlertExistingIsOpen}
          dataTestId="manage-password-alert-existing"
          headerText={`${i18n.t(
            "settings.sections.security.managepassword.page.alert.existingpassword"
          )}`}
          confirmButtonText={`${i18n.t(
            "settings.sections.security.managepassword.page.alert.ok"
          )}`}
          actionConfirm={() => handleClearExisting()}
        />
      </>
    );
  }
);

export { PasswordModule };
