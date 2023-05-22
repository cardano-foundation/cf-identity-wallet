import { useEffect, useState } from "react";
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
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import "./CreatePassword.scss";
import { CustomInput } from "../../components/CustomInput";
import { ErrorMessage } from "../../components/ErrorMessage";
import { RoutePath } from "../../../routes/paths";
import { PasswordRegexProps } from "./CreatePassword.types";

const STRING_LENGTH = "length";
const STRING_UPPERCASE = "uppercase";
const STRING_LOWERCASE = "lowercase";
const STRING_NUMBER = "number";
const STRING_SYMBOL = "symbol";
const STRING_SPECIAL_CHAR = "specialChar";
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

const RegexItem = ({
  condition,
  label,
}: {
  condition: RegExpMatchArray | null;
  label: string;
}) => {
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

const PasswordRegex = ({ password, setRegexState }: PasswordRegexProps) => {
  const specialChar = password.match(/(^[A-Za-z0-9]|[^\p{L}\d\s])$/u);
  const length = password.match(/^.{8,64}$/);
  const uppercase = password.match(/([A-Z])/);
  const lowercase = password.match(/([a-z])/);
  const number = password.match(/([0-9])/);
  const symbol = password.match(/[^\p{L}\d\s]/u);

  useEffect(() => {
    const regexState = (pass: boolean) => {
      switch (pass) {
        case !!length:
          return STRING_LENGTH;
        case !!uppercase:
          return STRING_UPPERCASE;
        case !!lowercase:
          return STRING_LOWERCASE;
        case !!number:
          return STRING_NUMBER;
        case !!symbol:
          return STRING_SYMBOL;
        case !!specialChar:
          return STRING_SPECIAL_CHAR;
        default:
          break;
      }
    };

    setRegexState(regexState(false) || "");
  }, [specialChar, length, uppercase, lowercase, number, symbol]);

  return (
    <IonList
      lines="none"
      className="operations-password-regex"
    >
      <RegexItem
        condition={length}
        label={i18n.t("operationspasswordregex.label.length")}
      />
      <RegexItem
        condition={uppercase}
        label={i18n.t("operationspasswordregex.label.uppercase")}
      />
      <RegexItem
        condition={lowercase}
        label={i18n.t("operationspasswordregex.label.lowercase")}
      />
      <RegexItem
        condition={number}
        label={i18n.t("operationspasswordregex.label.number")}
      />
      <RegexItem
        condition={symbol}
        label={i18n.t("operationspasswordregex.label.symbol")}
      />
    </IonList>
  );
};

const CreatePassword = () => {
  const [createPasswordValue, setCreatePasswordValue] = useState("");
  const [createPasswordFocus, setCreatePasswordFocus] = useState(false);
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
  const [createHintValue, setCreateHintValue] = useState("");
  const [regexState, setRegexState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const passwordValueMatching =
    createPasswordValue.length > 0 &&
    confirmPasswordValue.length > 0 &&
    createPasswordValue === confirmPasswordValue;
  const passwordValueNotMatching =
    createPasswordValue.length > 0 &&
    confirmPasswordValue.length > 0 &&
    createPasswordValue !== confirmPasswordValue;
  const validated =
    !regexState.length &&
    passwordValueMatching &&
    createHintValue !== createPasswordValue;

  useEffect(() => {
    const errorMessageHandler = (errorType: string) => {
      switch (errorType) {
        case STRING_SPECIAL_CHAR:
          return errorMessages.hasSpecialChar;
        case STRING_LENGTH:
          if (createPasswordValue.length < 8) {
            return errorMessages.isTooShort;
          } else if (createPasswordValue.length > 64) {
            return errorMessages.isTooLong;
          } else {
            return;
          }
        case STRING_UPPERCASE:
          return errorMessages.hasNoUppercase;
        case STRING_LOWERCASE:
          return errorMessages.hasNoLowercase;
        case STRING_NUMBER:
          return errorMessages.hasNoNumber;
        case STRING_SYMBOL:
          return errorMessages.hasNoSymbol;
        default:
          break;
      }
    };
    setErrorMessage(errorMessageHandler(regexState) || "");
  }, [createPasswordValue, confirmPasswordValue, regexState]);

  const handleContinue = () => {
    // TODO: this will need to be completed at a later stage
  };

  return (
    <IonPage className="page-layout create-password">
      <PageLayout
        header={true}
        currentPath={RoutePath.CREATE_PASSWORD}
        closeButton={true}
        closeButtonAction={() => {
          // TODO: this will need to be completed at a later stage
        }}
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
                title={i18n.t("createpassword.input.first.title")}
                placeholder={i18n.t("createpassword.input.first.placeholder")}
                hiddenInput={true}
                setValue={setCreatePasswordValue}
                setFocus={setCreatePasswordFocus}
              />
            </IonCol>
          </IonRow>
          {regexState === "specialChar" ? (
            <ErrorMessage
              message={errorMessage}
              timeout={false}
            />
          ) : regexState &&
            regexState !== "specialChar" &&
            !createPasswordFocus ? (
            <ErrorMessage
              message={errorMessage}
              timeout={false}
            />
          ) : null}
          {createPasswordValue && (
            <IonRow>
              <IonCol size="12">
                <PasswordRegex
                  password={createPasswordValue}
                  setRegexState={setRegexState}
                />
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <CustomInput
                dataTestId="confirmPasswordValue"
                title={i18n.t("createpassword.input.second.title")}
                placeholder={i18n.t("createpassword.input.second.placeholder")}
                hiddenInput={true}
                setValue={setConfirmPasswordValue}
                setFocus={setConfirmPasswordFocus}
              />
            </IonCol>
          </IonRow>
          {!confirmPasswordFocus && passwordValueNotMatching ? (
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
                title={i18n.t("createpassword.input.third.title")}
                placeholder={i18n.t("createpassword.input.third.placeholder")}
                hiddenInput={false}
                setValue={setCreateHintValue}
                optional={true}
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

export {
  CreatePassword,
  PasswordRegex,
  STRING_LENGTH,
  STRING_UPPERCASE,
  STRING_LOWERCASE,
  STRING_NUMBER,
  STRING_SYMBOL,
  STRING_SPECIAL_CHAR,
};
