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
import { pencilOutline, trashOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { ConnectionOptionsProps } from "./ConnectionOptions.types";
import "./ConnectionOptions.scss";

const ConnectionOptions = ({
  optionsIsOpen,
  setOptionsIsOpen,
  handleDelete,
}: ConnectionOptionsProps) => {
  return (
    <>
      <IonModal
        isOpen={optionsIsOpen}
        initialBreakpoint={0.25}
        breakpoints={[0, 0.25]}
        className="page-layout"
        data-testid="connection-options-modal"
        onDidDismiss={() => setOptionsIsOpen(false)}
      >
        <div className="connection-options modal menu">
          <IonHeader
            translucent={true}
            className="ion-no-border"
          >
            <IonToolbar color="light">
              <IonTitle data-testid="connection-options-title">
                <h2>{i18n.t("connections.details.options.title")}</h2>
              </IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent
            className="edit-connection-body"
            color="light"
          >
            <IonGrid className="edit-connection-main">
              <IonRow>
                <IonCol size="12">
                  <span
                    className="edit-connection-option"
                    data-testid="edit-connection-edit-button"
                  >
                    <span>
                      <IonButton shape="round">
                        <IonIcon
                          slot="icon-only"
                          icon={pencilOutline}
                        />
                      </IonButton>
                    </span>
                    <span className="edit-connection-label">
                      {i18n.t("connections.details.options.labels.edit")}
                    </span>
                  </span>
                  <span
                    className="edit-connection-option"
                    data-testid="edit-connection-delete-button"
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
                    <span className="edit-connection-label">
                      {i18n.t("connections.details.options.labels.delete")}
                    </span>
                  </span>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </div>
      </IonModal>
    </>
  );
};

export { ConnectionOptions };
