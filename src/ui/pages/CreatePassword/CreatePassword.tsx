import { useState } from "react";
import {
  IonCol,
  IonGrid,
  IonPage,
  IonRow,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
} from "@ionic/react";
import { closeOutline, checkmarkOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import "./CreatePassword.scss";
import { CustomInput } from "../../components/CustomInput";
import { ErrorMessage } from "../../components/ErrorMessage";
import { RoutePath } from "../../../routes";
import { PasswordRegexProps, RegexItemProps } from "./CreatePassword.types";
import { AriesAgent } from "../../../core/aries/ariesAgent";
import { MiscRecordId } from "../../../core/aries/modules";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {getStateCache} from "../../../store/reducers/stateCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { getBackRoute } from "../../../routes/backRoute";
import { updateReduxState } from "../../../store/utils";

const errorMessages = {
  hasSpecialChar: i18n.t("createpassword.error.hasSpecialChar"),
  isTooShort: i18n.t("createpassword.error.isTooShort"),
  isTooLong: i18n.t("createpassword.error.isTooLong"),
  hasNoUppercase: i18n.t("createpassword.error.hasNoUppercase"),
  hasNoLowercase: i18n.t("createpassword.error.hasNoLowercase"),
  hasNoNumber: i18n.t("createpassword.error.hasNoNumber"),
  hasNoSymbol: i18n.t("createpassword.error.hasNoSymbol"),
  hasNoMatch: i18n.t("createpassword.error.hasNoMatch"),
  hintSameAsPassword: i18n.t("createpassword.error.hintSameAsPassword"),
};

const PasswordValidator = {
  uppercaseRegex: /^(?=.*[A-Z])/,
  lowercaseRegex: /^(?=.*[a-z])/,
  numberRegex: /^(?=.*[0-9])/,
  symbolRegex: /^(?=.*[!@#$%^&*()])/,
  validCharactersRegex: /^[a-zA-Z0-9!@#$%^&*()]+$/,
  lengthRegex: /^.{8,64}$/,
  isLengthValid(password: string) {
    return this.lengthRegex.test(password);
  },
  isUppercaseValid(password: string) {
    return this.uppercaseRegex.test(password);
  },
  isLowercaseValid(password: string) {
    return this.lowercaseRegex.test(password);
  },
  isNumberValid(password: string) {
    return this.numberRegex.test(password);
  },
  isSymbolValid(password: string) {
    return this.symbolRegex.test(password);
  },
  isValidCharacters(password: string) {
    return this.validCharactersRegex.test(password);
  },
  validatePassword(password: string) {
    return (
      this.isUppercaseValid(password) &&
      this.isLowercaseValid(password) &&
      this.isNumberValid(password) &&
      this.isSymbolValid(password) &&
      this.isValidCharacters(password) &&
      this.isLengthValid(password)
    );
  },
  getErrorByPriority(password: string) {
    let errorMessage = undefined;
    if (password.length < 8) {
      errorMessage = errorMessages.isTooShort;
    } else if (password.length > 32) {
      errorMessage = errorMessages.isTooLong;
    } else if (!this.isUppercaseValid(password)) {
      errorMessage = errorMessages.hasNoUppercase;
    } else if (!this.isLowercaseValid(password)) {
      errorMessage = errorMessages.hasNoLowercase;
    } else if (!this.isNumberValid(password)) {
      errorMessage = errorMessages.hasNoNumber;
    } else if (!this.isSymbolValid(password)) {
      errorMessage = errorMessages.hasNoSymbol;
    } else if (!this.isValidCharacters(password)) {
      errorMessage = errorMessages.hasSpecialChar;
    }

    return errorMessage;
  },
};

const RegexItem = ({ condition, label }: RegexItemProps) => {
  return (
    <IonItem>
      <IonIcon
        slot="start"
        icon={condition ? checkmarkOutline : closeOutline}
        className={`password-criteria-icon${condition ? " pass" : " fails"}`}
      />
      <IonLabel>{label}</IonLabel>
    </IonItem>
  );
};

const PasswordRegex = ({ password }: PasswordRegexProps) => {
  return (
    <IonList
      lines="none"
      className="operations-password-regex"
    >
      <RegexItem
        condition={PasswordValidator.isLengthValid(password)}
        label={i18n.t("operationspasswordregex.label.length")}
      />
      <RegexItem
        condition={PasswordValidator.isUppercaseValid(password)}
        label={i18n.t("operationspasswordregex.label.uppercase")}
      />
      <RegexItem
        condition={PasswordValidator.isLowercaseValid(password)}
        label={i18n.t("operationspasswordregex.label.lowercase")}
      />
      <RegexItem
        condition={PasswordValidator.isNumberValid(password)}
        label={i18n.t("operationspasswordregex.label.number")}
      />
      <RegexItem
        condition={PasswordValidator.isSymbolValid(password)}
        label={i18n.t("operationspasswordregex.label.symbol")}
      />
    </IonList>
  );
};

const CreatePassword = () => {
  const stateCache = useAppSelector(getStateCache);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const [createPasswordValue, setCreatePasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [createHintValue, setCreateHintValue] = useState("");

  const passwordValueMatching =
    createPasswordValue.length > 0 &&
    confirmPasswordValue.length > 0 &&
    createPasswordValue === confirmPasswordValue;
  const passwordValueNotMatching =
    createPasswordValue.length > 0 &&
    confirmPasswordValue.length > 0 &&
    createPasswordValue !== confirmPasswordValue;
  const validated =
    PasswordValidator.validatePassword(createPasswordValue) &&
    passwordValueMatching &&
    createHintValue !== createPasswordValue;

  const handlePasswordInput = (password: string) => {
    setCreatePasswordValue(password);
  };
  const handleClearState = () => {
    setCreatePasswordValue("");
    setConfirmPasswordValue("");
    setCreateHintValue("");
  };
  const handleClose = async () => {
    const { backPath } = getBackRoute(RoutePath.CREATE_PASSWORD, {
      store: {stateCache},
    });

    history.push(backPath.pathname);
    handleClearState();
  };

  const handleContinue = async () => {
    // @TODO - foconnor: We should handle errors here and display something to the user as feedback to try again.
    await SecureStorage.set(KeyStoreKeys.APP_OP_PASSWORD, createPasswordValue);
    if (createHintValue) {
      await AriesAgent.agent.storeMiscRecord(
        MiscRecordId.OP_PASS_HINT,
        createHintValue
      );
    }
    const { nextPath, updateRedux } = getNextRoute(RoutePath.CREATE_PASSWORD, {
      store: {stateCache},
    });

    updateReduxState(
      nextPath.pathname,
      { store: {stateCache} },
      dispatch,
      updateRedux
    );
    updateReduxState(nextPath.pathname, {}, dispatch, updateRedux);
    history.push(nextPath.pathname);
    handleClearState();
    // @TODO - sdisalvo: this will need to be completed at a later stage (navigation)
  };

  return (
    <IonPage className="page-layout create-password">
      <PageLayout
        header={true}
        currentPath={RoutePath.CREATE_PASSWORD}
        closeButton={true}
        closeButtonAction={() => handleClose()}
        title={`${i18n.t("createpassword.title")}`}
        footer={true}
        primaryButtonText={`${i18n.t("createpassword.continue.button")}`}
        primaryButtonAction={handleContinue}
        primaryButtonDisabled={!validated}
      >
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <p className="page-paragraph">
                {i18n.t("createpassword.description")}
              </p>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
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
                onChangeFocus={setPasswordFocus}
                value={createPasswordValue}
              />
            </IonCol>
          </IonRow>
          {(createPasswordValue !== "" &&
            !PasswordValidator.validatePassword(createPasswordValue)) ||
          !PasswordValidator.isValidCharacters(createPasswordValue) ? (
            <ErrorMessage
              message={
                createPasswordValue.length
                  ? PasswordValidator.getErrorByPriority(createPasswordValue)
                  : undefined
              }
              timeout={false}
            />
          ) : null}
          {createPasswordValue && (
            <IonRow>
              <IonCol size="12">
                <PasswordRegex password={createPasswordValue} />
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
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
              />
            </IonCol>
          </IonRow>
          {confirmPasswordFocus && passwordValueNotMatching ? (
            <ErrorMessage
              message={errorMessages.hasNoMatch}
              timeout={false}
            />
          ) : null}
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <CustomInput
                dataTestId="createHintValue"
                title={`${i18n.t("createpassword.input.third.title")}`}
                placeholder={`${i18n.t(
                  "createpassword.input.third.placeholder"
                )}`}
                hiddenInput={false}
                onChangeInput={setCreateHintValue}
                optional={true}
                value={createHintValue}
              />
            </IonCol>
          </IonRow>
          {createHintValue && createHintValue === createPasswordValue ? (
            <ErrorMessage
              message={errorMessages.hintSameAsPassword}
              timeout={false}
            />
          ) : null}
        </IonGrid>
      </PageLayout>
    </IonPage>
  );
};

export { CreatePassword, PasswordRegex, PasswordValidator };
