import { forwardRef, useImperativeHandle, useState } from "react";
import { useSelector } from "react-redux";
import { Agent } from "../../../core/agent/agent";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { BasicRecord } from "../../../core/agent/records";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { i18n } from "../../../i18n";
import { useAppDispatch } from "../../../store/hooks";
import {
  getStateCache,
  setAuthentication,
} from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { showError } from "../../utils/error";
import { passwordStrengthChecker } from "../../utils/passwordStrengthChecker";
import { Alert as AlertCancel, Alert as AlertExisting } from "../Alert";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";
import { PageFooter } from "../PageFooter";
import { PasswordValidation } from "../PasswordValidation";
import "./PasswordModule.scss";
import { PasswordModuleProps, PasswordModuleRef } from "./PasswordModule.types";

const PasswordModule = forwardRef<PasswordModuleRef, PasswordModuleProps>(
  ({ title, isOnboarding, description, testId, onCreateSuccess }, ref) => {
    const dispatch = useAppDispatch();
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
      if (skipped) {
        await Agent.agent.basicStorage
          .createOrUpdateBasicRecord(
            new BasicRecord({
              id: MiscRecordId.APP_PASSWORD_SKIPPED,
              content: { value: skipped },
            })
          )
          .catch((e) => {
            showError("Unable to skip set password", e, dispatch);
          });
      } else {
        if (authentication.passwordIsSet) {
          const currentPassword = await SecureStorage.get(
            KeyStoreKeys.APP_OP_PASSWORD
          ).catch((e) => {
            if (
              e instanceof Error &&
              e.message ===
                `${SecureStorage.KEY_NOT_FOUND} ${KeyStoreKeys.APP_OP_PASSWORD}`
            ) {
              return undefined;
            }

            showError("Unable to get current password", e, dispatch);
          });
          if (
            currentPassword !== undefined &&
            currentPassword === createPasswordValue
          ) {
            setAlertExistingIsOpen(true);
            return;
          }
        }
        await SecureStorage.set(
          KeyStoreKeys.APP_OP_PASSWORD,
          createPasswordValue
        );

        if (authentication.passwordIsSkipped) {
          await Agent.agent.basicStorage.deleteById(
            MiscRecordId.APP_PASSWORD_SKIPPED
          );
        }

        dispatch(
          setAuthentication({
            ...authentication,
            passwordIsSet: true,
            passwordIsSkipped: false,
          })
        );
        if (hintValue) {
          await Agent.agent.basicStorage.createOrUpdateBasicRecord(
            new BasicRecord({
              id: MiscRecordId.OP_PASS_HINT,
              content: { value: hintValue },
            })
          );
        } else {
          try {
            const previousHint = (
              await Agent.agent.basicStorage.findById(MiscRecordId.OP_PASS_HINT)
            )?.content?.value;

            if (previousHint) {
              await Agent.agent.basicStorage.deleteById(
                MiscRecordId.OP_PASS_HINT
              );
            }
          } catch (e) {
            showError(
              "Unable to delete password hint",
              e,
              dispatch,
              ToastMsgType.UNABLE_DELETE_PASSWORD_HINT
            );
          }
        }
      }

      onCreateSuccess(skipped);
      handleClearState();
    };

    return (
      <>
        <div className="password-module">
          <form className="page-content">
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
          </form>
          <PageFooter
            pageId={testId}
            primaryButtonText={`${i18n.t("createpassword.button.continue")}`}
            primaryButtonAction={() => handleContinue(false)}
            primaryButtonDisabled={!validated}
            tertiaryButtonText={
              isOnboarding
                ? `${i18n.t("createpassword.button.skip")}`
                : undefined
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
            "tabs.menu.tab.settings.sections.security.managepassword.page.alert.existingpassword"
          )}`}
          confirmButtonText={`${i18n.t(
            "tabs.menu.tab.settings.sections.security.managepassword.page.alert.ok"
          )}`}
          actionConfirm={() => handleClearExisting()}
        />
      </>
    );
  }
);

export { PasswordModule };
