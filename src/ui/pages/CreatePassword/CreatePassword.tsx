import { useState } from "react";
import {
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
} from "@ionic/react";
import { closeOutline, checkmarkOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import "./CreatePassword.scss";
import { InputItem } from "../../components/InputItem";

const CreatePassword = () => {
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createHint, setCreateHint] = useState("");
  const hasLength = createPassword.match(/^.{8,64}$/);
  const hasUppercase = createPassword.match(/([A-Z])/);
  const hasLowercase = createPassword.match(/([a-z])/);
  const hasNumber = createPassword.match(/([0-9])/);
  const hasSymbol = createPassword.match(/[^\p{L}\d\s]/);
  const combinedRegex =
    hasLength && hasUppercase && hasLowercase && hasNumber && hasSymbol;
  const validated = combinedRegex && createPassword === confirmPassword;

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
          {createPassword && (
            <IonRow>
              <IonCol
                size="12"
                className="password-criteria"
              >
                <IonList lines="none">
                  <IonItem>
                    <IonIcon
                      slot="start"
                      icon={hasLength ? checkmarkOutline : closeOutline}
                      className={`password-criteria-icon${
                        hasLength ? " pass" : " fails"
                      }`}
                    />
                    <IonLabel>8 - 64 characters long</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonIcon
                      slot="start"
                      icon={hasUppercase ? checkmarkOutline : closeOutline}
                      className={`password-criteria-icon${
                        hasUppercase ? " pass" : " fails"
                      }`}
                    />
                    <IonLabel>Contains an uppercase letter</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonIcon
                      slot="start"
                      icon={hasLowercase ? checkmarkOutline : closeOutline}
                      className={`password-criteria-icon${
                        hasLowercase ? " pass" : " fails"
                      }`}
                    />
                    <IonLabel>Contains a lowercase letter</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonIcon
                      slot="start"
                      icon={hasNumber ? checkmarkOutline : closeOutline}
                      className={`password-criteria-icon${
                        hasNumber ? " pass" : " fails"
                      }`}
                    />
                    <IonLabel>Contains a number</IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonIcon
                      slot="start"
                      icon={hasSymbol ? checkmarkOutline : closeOutline}
                      className={`password-criteria-icon${
                        hasSymbol ? " pass" : " fails"
                      }`}
                    />
                    <IonLabel>Contains a symbol</IonLabel>
                  </IonItem>
                </IonList>
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
