import {IonButton, IonCol, IonGrid, IonItem, IonModal, IonRow} from "@ionic/react";
import { useEffect, useState } from "react";
import { i18n } from "../../../i18n";
import { PageLayout } from "../layout/PageLayout";
import { CreateIdentityProps } from "./CreateIdentity.types";
import { CustomInput } from "../CustomInput";
import { ErrorMessage, MESSAGE_MILLISECONDS } from "../ErrorMessage";
import "./CreateIdentity.scss";
import { Alert } from "../Alert";
import {
  KeyStoreKeys,
  SecureStorage,
} from "../../../core/storage/secureStorage";
import { AriesAgent } from "../../../core/aries/ariesAgent";
import { MiscRecordId } from "../../../core/aries/modules";

const CreateIdentity = ({
  modalIsOpen,
  setModalIsOpen,
}: CreateIdentityProps) => {
  const [displayNameValue, setDisplayNameValue] = useState("");

  const resetModal = () => {
    setModalIsOpen(false);
    setDisplayNameValue("");
  };

  const handleReset = () => {
    resetModal();
    // @TODO - sdisalvo: navigate the user to the Reset Operations Password Screen
  };

  return (
    <IonModal
      isOpen={modalIsOpen}
      initialBreakpoint={0.4}
      breakpoints={[0.4]}
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
                <IonItem className="type-input">
                  <div className="centered-text">
                    <span>{`${i18n.t(
                      "createIdentity.identityType.types.type0"
                    )}`}</span>
                  </div>
                </IonItem>
              </IonCol>
              <IonCol className="col-right">
                <IonItem className="type-input">
                  <div className="centered-text">
                    <span>{`${i18n.t(
                      "createIdentity.identityType.types.type1"
                    )}`}</span>
                  </div>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
        </PageLayout>
      </div>
    </IonModal>
  );
};

export { CreateIdentity };
