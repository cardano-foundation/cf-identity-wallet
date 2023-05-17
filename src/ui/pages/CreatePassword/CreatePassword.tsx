import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
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
  const history = useHistory();
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createHint, setCreateHint] = useState("");
  const [validated, setValidated] = useState(false);

  const regexLength = /^.{8,64}$/;
  const regexUppercase = /([A-Z])/;
  const regexLowercase = /([a-z])/;
  const regexNumber = /([0-9])/;
  const regexSymbol = /[\W\S_]/;
  const hasLength = regexLength.test(createPassword);
  const hasUppercase = regexUppercase.test(createPassword);
  const hasLowercase = regexLowercase.test(createPassword);
  const hasNumber = regexNumber.test(createPassword);
  const hasSymbol = regexSymbol.test(createPassword);

  const handleContinue = () => {
    console.log("continue");
  };

  return (
    <IonPage className="page-layout create-password">
      <PageLayout
        header={true}
        closeButton={true}
        closeButtonAction={() => history.goBack()}
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
