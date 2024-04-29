import { useState } from "react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import "./CreatePassword.scss";
import { CustomInput } from "../../components/CustomInput";
import { ErrorMessage } from "../../components/ErrorMessage";
import { RoutePath } from "../../../routes";
import { Agent } from "../../../core/agent/agent";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getStateCache,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { Alert } from "../../components/Alert";
import { OperationType } from "../../globals/types";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { PageHeader } from "../../components/PageHeader";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { PageFooter } from "../../components/PageFooter";
import { passwordStrengthChecker } from "../../utils/passwordStrengthChecker";
import { PasswordValidation } from "../../components/PasswordValidation";
import { RecordType } from "../../../core/storage/storage.types";

const CreatePassword = () => {
  const pageId = "create-password";
  const stateCache = useAppSelector(getStateCache);
  const history = useHistory();
  const dispatch = useAppDispatch();
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

  const handleContinue = async (skipped: boolean) => {
    // @TODO - foconnor: We should handle errors here and display something to the user as feedback to try again.
    if (!skipped) {
      await SecureStorage.set(
        KeyStoreKeys.APP_OP_PASSWORD,
        createPasswordValue
      );
      if (hintValue) {
        await Agent.agent.basicStorage.save({
          id: MiscRecordId.OP_PASS_HINT,
          content: { value: hintValue },
          tags: {
            type: RecordType.OP_PASS_HINT,
          },
        });
      }
    }

    const { nextPath, updateRedux } = getNextRoute(RoutePath.CREATE_PASSWORD, {
      store: { stateCache },
      state: { skipped },
    });

    updateReduxState(
      nextPath.pathname,
      {
        store: { stateCache },
        state: { skipped },
      },
      dispatch,
      updateRedux
    );
    dispatch(setCurrentOperation(OperationType.IDLE));
    history.push(nextPath.pathname);
    handleClearState();
  };

  return (
    <ScrollablePageLayout
      pageId={pageId}
      header={
        <PageHeader
          backButton={true}
          beforeBack={handleClearState}
          currentPath={RoutePath.CREATE_PASSWORD}
          progressBar={true}
          progressBarValue={0.5}
          progressBarBuffer={1}
        />
      }
    >
      <h2 data-testid={`${pageId}-title`}>{i18n.t("createpassword.title")}</h2>
      <p
        className="page-paragraph"
        data-testid={`${pageId}-top-paragraph`}
      >
        {i18n.t("createpassword.description")}
      </p>
      <CustomInput
        dataTestId="createPasswordValue"
        title={`${i18n.t("createpassword.input.first.title")}`}
        placeholder={`${i18n.t("createpassword.input.first.placeholder")}`}
        hiddenInput={true}
        onChangeInput={(password: string) => handlePasswordInput(password)}
        onChangeFocus={setCreatePasswordFocus}
        value={createPasswordValue}
        error={
          !createPasswordFocus &&
          !!createPasswordValue.length &&
          (!passwordStrengthChecker.validatePassword(createPasswordValue) ||
            !passwordStrengthChecker.isValidCharacters(createPasswordValue))
        }
      />
      {createPasswordValue && (
        <PasswordValidation password={createPasswordValue} />
      )}
      <CustomInput
        dataTestId="confirm-password-value"
        title={`${i18n.t("createpassword.input.second.title")}`}
        placeholder={`${i18n.t("createpassword.input.second.placeholder")}`}
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
        placeholder={`${i18n.t("createpassword.input.third.placeholder")}`}
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

      <PageFooter
        pageId={pageId}
        primaryButtonText={`${i18n.t("createpassword.button.continue")}`}
        primaryButtonAction={() => handleContinue(false)}
        primaryButtonDisabled={!validated}
        tertiaryButtonText={`${i18n.t("createpassword.button.skip")}`}
        tertiaryButtonAction={() => setAlertIsOpen(true)}
      />
      <Alert
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="create-password-alert-skip"
        headerText={`${i18n.t("createpassword.alert.text")}`}
        confirmButtonText={`${i18n.t("createpassword.alert.button.confirm")}`}
        cancelButtonText={`${i18n.t("createpassword.alert.button.cancel")}`}
        actionConfirm={() => handleContinue(true)}
      />
    </ScrollablePageLayout>
  );
};

export { CreatePassword };
