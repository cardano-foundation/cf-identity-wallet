import {
  IonButton,
  IonCol,
  IonGrid,
  IonItem,
  IonModal,
  IonRow,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { CreateIdentityProps } from "./CreateIdentity.types";
import { CustomInput } from "../CustomInput";
import { ErrorMessage, MESSAGE_MILLISECONDS } from "../ErrorMessage";
import "./CreateIdentity.scss";
const CreateIdentity = ({
  modalIsOpen,
  setModalIsOpen,
}: CreateIdentityProps) => {
  const [displayNameValue, setDisplayNameValue] = useState("");
  const [selectedType, setSelectedType] = useState<number | undefined>(
    undefined
  );

  const resetModal = () => {
    setModalIsOpen(false);
    setDisplayNameValue("");
  };

  const handleCreateIdentity = () => {

  };

  const displayNameValueIsValid = displayNameValue.length > 0 && displayNameValue.length <= 32;
  const typeIsSelectedIsValid = selectedType !== undefined;

  return (
    <IonModal
      isOpen={modalIsOpen}
      initialBreakpoint={0.45}
      breakpoints={[0.45]}
      className="page-layout"
      data-testid="verify-password"
      onDidDismiss={() => resetModal()}
    >
      <div className="create-identity modal">
        <PageLayout
          header={true}
          closeButton={true}
          closeButtonLabel={`${i18n.t("verifypassword.cancel")}`}
          closeButtonAction={() => setModalIsOpen(false)}
          title={`${i18n.t("createIdentity.title")}`}
        >
          <IonGrid>
            <IonRow>
              <IonCol>
                <CustomInput
                  dataTestId="display-name-input"
                  title={`${i18n.t("createIdentity.displayName.title")}`}
                  placeholder={`${i18n.t(
                    "createIdentity.displayName.placeholder"
                  )}`}
                  hiddenInput={false}
                  onChangeInput={setDisplayNameValue}
                  value={displayNameValue}
                />
              </IonCol>
            </IonRow>
            <IonRow>
              <span className="type-input-title">{`${i18n.t(
                "createIdentity.identityType.title"
              )}`}</span>
            </IonRow>
            <IonRow>
              <IonCol className="col-left">
                <IonItem
                  onClick={() => setSelectedType(0)}
                  className={`type-input ${selectedType === 0 ? "selectedType" : ""}`}
                >
                  <div className="centered-text">
                    <span>{`${i18n.t(
                      "createIdentity.identityType.types.type0"
                    )}`}</span>
                  </div>
                </IonItem>
              </IonCol>
              <IonCol className="col-right">
                <IonItem
                  onClick={() => setSelectedType(1)}
                  className={`type-input ${selectedType === 1 ? "selectedType" : ""}`}
                >
                  <div className="centered-text">
                    <span>{`${i18n.t(
                      "createIdentity.identityType.types.type1"
                    )}`}</span>
                  </div>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow className="continue-button-container">
              <IonCol>
                <IonButton
                  shape="round"
                  expand="block"
                  className="ion-primary-button"
                  data-testid="continue-button"
                  onClick={() => handleCreateIdentity()}
                  disabled={!(displayNameValueIsValid && typeIsSelectedIsValid)}
                >
                  {`${i18n.t(
                    "createIdentity.confirmButton"
                  )}`}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { CreateIdentity };
