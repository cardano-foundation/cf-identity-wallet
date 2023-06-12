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

const EditIdentity = ({ isOpen, setIsOpen, id, name }: EditIdentityProps) => {
  const editIdentity = () => {
    //
  };
  return (
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
                  onClick={editIdentity}
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
                  onClick={editIdentity}
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
  );
};

export { EditIdentity };
