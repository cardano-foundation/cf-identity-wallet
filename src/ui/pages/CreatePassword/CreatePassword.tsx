import { useState } from "react";
import { IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { closeOutline, checkmarkOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import "./CreatePassword.scss";
import { CustomInput } from "../../components/CustomInput";
import { ErrorMessage } from "../../components/ErrorMessage";
import { RoutePath } from "../../../routes";
import { AriesAgent } from "../../../core/agent/agent";
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
import PageFooter from "../../components/PageFooter/PageFooter";
import { passwordStrengthChecker } from "../../utils/passwordStrengthChecker";
import { PasswordValidation } from "../../components/PasswordValidation";

const CreatePassword = () => {
  const pageId = "create-password";
  const stateCache = useAppSelector(getStateCache);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const [passwordValue, setCreatePasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [createHintValue, setCreateHintValue] = useState("");
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const passwordValueMatching =
    passwordValue.length > 0 &&
    confirmPasswordValue.length > 0 &&
    passwordValue === confirmPasswordValue;
  const passwordValueNotMatching =
    passwordValue.length > 0 &&
    confirmPasswordValue.length > 0 &&
    passwordValue !== confirmPasswordValue;
  const validated =
    passwordStrengthChecker.validatePassword(passwordValue) &&
    passwordValueMatching &&
    createHintValue !== passwordValue;

  const handlePasswordInput = (password: string) => {
    setCreatePasswordValue(password);
  };
  const handleClearState = () => {
    setCreatePasswordValue("");
    setConfirmPasswordValue("");
    setCreateHintValue("");
  };
  const handleClose = async () => {
    handleClearState();
    handleContinue(true);
  };

  const handleContinue = async (skipped: boolean) => {
    // @TODO - foconnor: We should handle errors here and display something to the user as feedback to try again.
    if (!skipped) {
      await SecureStorage.set(KeyStoreKeys.APP_OP_PASSWORD, passwordValue);
      if (createHintValue) {
        await AriesAgent.agent.genericRecords.save({
          id: MiscRecordId.OP_PASS_HINT,
          content: { value: createHintValue },
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
      <p className="page-paragraph">{i18n.t("createpassword.description")}</p>
      <CustomInput
        dataTestId="passwordValue"
        title={`${i18n.t("createpassword.input.first.title")}`}
        placeholder={`${i18n.t("createpassword.input.first.placeholder")}`}
        hiddenInput={true}
        onChangeInput={(password: string) => handlePasswordInput(password)}
        onChangeFocus={setPasswordFocus}
        value={passwordValue}
        error={
          !passwordFocus &&
          !!passwordValue.length &&
          (!passwordStrengthChecker.validatePassword(passwordValue) ||
            !passwordStrengthChecker.isValidCharacters(passwordValue))
        }
      />
      {passwordValue && <PasswordValidation password={passwordValue} />}
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
          passwordValueNotMatching
        }
      />
      {!confirmPasswordFocus &&
        !!confirmPasswordValue.length &&
        passwordValueNotMatching && (
        <ErrorMessage
          message={`${i18n.t("createpassword.error.hasNoMatch")}`}
          timeout={false}
        />
      )}
      <CustomInput
        dataTestId="createHintValue"
        title={`${i18n.t("createpassword.input.third.title")}`}
        placeholder={`${i18n.t("createpassword.input.third.placeholder")}`}
        hiddenInput={false}
        onChangeInput={setCreateHintValue}
        optional={true}
        value={createHintValue}
      />
      {createHintValue && createHintValue === passwordValue ? (
        <ErrorMessage
          message={`${i18n.t("createpassword.error.hintSameAsPassword")}`}
          timeout={false}
        />
      ) : null}

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
