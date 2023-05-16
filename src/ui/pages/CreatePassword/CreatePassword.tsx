import { useHistory } from "react-router-dom";
import { useState } from "react";
import {
  IonButton,
  IonCol,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
} from "@ionic/react";
import { eyeOffOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { PageLayout } from "../../components/layout/PageLayout";
import "./CreatePassword.scss";

const CreatePassword = () => {
  const history = useHistory();
  const [hiddenInput, setHiddenInput] = useState(false);

  return (
    <IonPage className="page-layout create-password">
      <PageLayout
        header={true}
        closeButton={true}
        closeButtonAction={() => history.goBack()}
        title={`${i18n.t("createpassword.title")}`}
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
              <IonItem>
                <IonLabel position="stacked">
                  {i18n.t("createpassword.input.first.title")} -{" "}
                  {hiddenInput ? "true" : "false"}
                </IonLabel>
                <IonInput
                  placeholder={`${i18n.t(
                    "createpassword.input.first.placeholder"
                  )}`}
                >
                  <IonButton
                    shape="round"
                    onClick={() => {
                      setHiddenInput(!hiddenInput);
                    }}
                  >
                    <IonIcon
                      slot="icon-only"
                      icon={eyeOffOutline}
                      color="primary"
                    />
                  </IonButton>
                </IonInput>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>
      </PageLayout>
    </IonPage>
  );
};

export { CreatePassword };
