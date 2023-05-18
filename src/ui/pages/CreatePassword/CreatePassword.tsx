import { useEffect, useState } from "react";
import { IonCol, IonGrid, IonPage, IonRow } from "@ionic/react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import "./CreatePassword.scss";

import { InputItem } from "../../components/InputItem";
import { OperationsPasswordRegex } from "../../components/OperationsPasswordRegex";
import { ErrorMessage } from "../../components/ErrorMessage";

const CreatePassword = () => {
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createHint, setCreateHint] = useState("");
  const [regexState, setRegexState] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const validated =
    createPassword.length &&
    !regexState.length &&
    createPassword === confirmPassword;
  const errorMessages = {
    hasSpecialChar: i18n.t("createpassword.error.hasSpecialChar"),
    hasLength: {
      tooShort: i18n.t("createpassword.error.hasLength.tooShort"),
      tooLong: i18n.t("createpassword.error.hasLength.tooLong"),
    },
    hasUppercase: i18n.t("createpassword.error.hasUppercase"),
    hasLowercase: i18n.t("createpassword.error.hasLowercase"),
    hasNumber: i18n.t("createpassword.error.hasNumber"),
    hasSymbol: i18n.t("createpassword.error.hasSymbol"),
  };

  useEffect(() => {
    const errorMessageHandler = (errorType: string) => {
      switch (errorType) {
        case "hasSpecialChar":
          return errorMessages.hasSpecialChar;
        case "hasLength":
          if (createPassword.length < 8) {
            return errorMessages.hasLength.tooShort;
          } else if (createPassword.length > 64) {
            return errorMessages.hasLength.tooLong;
          } else {
            return;
          }
        case "hasUppercase":
          return errorMessages.hasUppercase;
        case "hasLowercase":
          return errorMessages.hasLowercase;
        case "hasNumber":
          return errorMessages.hasNumber;
        case "hasSymbol":
          return errorMessages.hasSymbol;
        default:
          break;
      }
    };

    setErrorMessage(String(errorMessageHandler(regexState) || ""));
  }, [createPassword, regexState]);

  const handleContinue = () => {
    // TODO: this will need to be completed at a later stage
    console.log("continue");
  };

  return (
    <IonPage className="page-layout create-password">
      <PageLayout
        header={true}
        closeButton={true}
        closeButtonAction={() => {
          // TODO: this will need to be completed at a later stage
          console.log("close");
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
              <InputItem
                title={i18n.t("createpassword.input.first.title")}
                placeholder={i18n.t("createpassword.input.first.placeholder")}
                hiddenInput={true}
                setValue={setCreatePassword}
              />
            </IonCol>
          </IonRow>
          {/* if there weren't enough chars 
          or the confirmation of the password didn't match
          the errors would appear when leaving focus

          But for things like incorrect char like a space or special char, 
          this should come up when entered 
          and block the user from continuing until they delete the char

          For the message, I think it should be in the order of priority. 
          
          So the char length would go first, then uppercase, lowercase, etc.

          Ideally they would disappear once the error had been rectified */}
          {createPassword.length && regexState.length ? (
            <ErrorMessage
              message={errorMessage}
              timeout={false}
            />
          ) : null}
          {createPassword && (
            <IonRow>
              <IonCol size="12">
                <OperationsPasswordRegex
                  password={createPassword}
                  setRegexState={setRegexState}
                />
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <InputItem
                title={i18n.t("createpassword.input.second.title")}
                placeholder={i18n.t("createpassword.input.second.placeholder")}
                hiddenInput={true}
                setValue={setConfirmPassword}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <InputItem
                title={i18n.t("createpassword.input.third.title")}
                placeholder={i18n.t("createpassword.input.third.placeholder")}
                hiddenInput={false}
                setValue={setCreateHint}
                optional={true}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </PageLayout>
    </IonPage>
  );
};

export { CreatePassword };
