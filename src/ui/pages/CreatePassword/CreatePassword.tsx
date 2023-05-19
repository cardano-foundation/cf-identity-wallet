import { useEffect, useState } from "react";
import { IonCol, IonGrid, IonPage, IonRow } from "@ionic/react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import "./CreatePassword.scss";

import { CustomInput } from "../../components/CustomInput";
import { OperationsPasswordRegex } from "../../components/OperationsPasswordRegex";
import { ErrorMessage } from "../../components/ErrorMessage";
import { RoutePath } from "../../../routes/paths";

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

  useEffect(() => {
    const errorMessageHandler = (errorType: string) => {
      switch (errorType) {
        case "specialChar":
          return errorMessages.hasSpecialChar;
        case "length":
          if (createPasswordValue.length < 8) {
            return errorMessages.isTooShort;
          } else if (createPasswordValue.length > 64) {
            return errorMessages.isTooLong;
          } else {
            return;
          }
        case "uppercase":
          return errorMessages.hasNoUppercase;
        case "lowercase":
          return errorMessages.hasNoLowercase;
        case "number":
          return errorMessages.hasNoNumber;
        case "symbol":
          return errorMessages.hasNoSymbol;
        default:
          break;
      }
    };
    setErrorMessage(String(errorMessageHandler(regexState) || ""));
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
        primaryButtonAction={() => handleContinue()}
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
                <OperationsPasswordRegex
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

export { CreatePassword };
