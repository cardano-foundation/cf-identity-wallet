import { useEffect, useState } from "react";
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonModal,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Share } from "@capacitor/share";
import { pencilOutline, shareOutline, trashOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { EditIdentityProps } from "./EditIdentity.types";
import "./EditIdentity.scss";
import { PageLayout } from "../layout/PageLayout";
import { CustomInput } from "../CustomInput";
import { ErrorMessage } from "../ErrorMessage";

const EditIdentity = ({ isOpen, setIsOpen, id, name }: EditIdentityProps) => {
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(name);
  const DISPLAY_NAME_LENGTH = 32;
  const verifyDisplayName =
    newDisplayName.length > 0 &&
    newDisplayName.length <= DISPLAY_NAME_LENGTH &&
    newDisplayName !== name;

  useEffect(() => {
    setNewDisplayName(name);
  }, [name]);

  const handleDelete = () => {
    // TODO: handle delete identity
  };

  const EditModal = () => {
    const handleDismiss = () => {
      setEditIsOpen(false);
      setNewDisplayName(name);
    };

    const submitDisplayName = () => {
      setEditIsOpen(false);
    };

    return (
      <IonModal
        isOpen={editIsOpen}
        initialBreakpoint={0.3}
        breakpoints={[0.3]}
        className="page-layout edit-identity-inner"
        data-testid="edit-identity-inner"
        onDidDismiss={handleDismiss}
      >
        <div className="modal">
          <PageLayout
            header={true}
            title={`${i18n.t("editidentity.title")}`}
            footer={true}
            primaryButtonText={`${i18n.t("editidentity.inner.confirm")}`}
            primaryButtonAction={submitDisplayName}
            primaryButtonDisabled={!verifyDisplayName}
          >
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <CustomInput
                    dataTestId="edit-display-name"
                    title={`${i18n.t("editidentity.inner.label")}`}
                    hiddenInput={false}
                    autofocus={true}
                    onChangeInput={setNewDisplayName}
                    value={newDisplayName}
                  />
                </IonCol>
              </IonRow>
              {newDisplayName.length > DISPLAY_NAME_LENGTH ? (
                <ErrorMessage
                  message={i18n.t("editidentity.inner.error")}
                  timeout={false}
                />
              ) : (
                <div className="error-placeholder" />
              )}
            </IonGrid>
          </PageLayout>
        </div>
      </IonModal>
    );
  };

  return (
    <>
      <IonModal
        isOpen={isOpen}
        initialBreakpoint={0.3}
        breakpoints={[0.3]}
        className="page-layout"
        data-testid="edit-identity"
        onDidDismiss={() => setIsOpen(false)}
      >
        <div className="edit-identity modal">
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              <IonTitle data-testid="edit-identity-title">
                <h2>{i18n.t("editidentity.title")}</h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent
            className="edit-identity-body"
            color="light"
          >
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <span
                    className="edit-identity-option"
                    data-testid="edit-identity-edit-button"
                    onClick={() => setEditIsOpen(true)}
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={pencilOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="edit-identity-label">
                      {i18n.t("editidentity.title")}
                    </span>
                  </span>
                  <span
                    className="edit-identity-option"
                    data-testid="edit-identity-share-button"
                    onClick={async () => {
                      await Share.share({
                        text: name + " " + id,
                      });
                    }}
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={shareOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="edit-identity-info-block-data">
                      {i18n.t("editidentity.share")}
                    </span>
                  </span>
                  <span
                    className="edit-identity-option"
                    data-testid="edit-identity-delete-button"
                    onClick={handleDelete}
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={trashOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="edit-identity-label">
                      {i18n.t("editidentity.delete")}
                    </span>
                  </span>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </div>
      </IonModal>
      <EditModal />
    </>
  );
};

export { EditIdentity };
