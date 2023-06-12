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
import { copyOutline, openOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { ShareIdentityProps } from "./ShareIdentity.types";
import { writeToClipboard } from "../../../utils/clipboard";
import "./ShareIdentity.scss";

const ShareIdentity = ({ isOpen, setIsOpen, id, name }: ShareIdentityProps) => {
  return (
    <IonModal
      isOpen={isOpen}
      initialBreakpoint={0.75}
      breakpoints={[0.75]}
      className="page-layout"
      data-testid="share-identity"
      onDidDismiss={() => setIsOpen(false)}
    >
      <div className="share-identity modal">
        <IonHeader
          translucent={true}
          className="ion-no-border"
        >
          <IonToolbar color="light">
            <IonTitle data-testid="share-identity-title">
              <h2>{i18n.t("shareidentity.title")}</h2>
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent
          className="share-identity-body"
          color="light"
        >
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <span className="share-identity-line">
                  <span>
                    <IonButton
                      shape="round"
                      data-testid="share-identity-copy-button"
                      onClick={() => writeToClipboard(id)}
                    >
                      <IonIcon
                        slot="icon-only"
                        icon={copyOutline}
                      />
                    </IonButton>
                  </span>
                  <span className="share-identity-label">
                    {i18n.t("shareidentity.copykey")}
                  </span>
                </span>
                <span className="share-identity-line">
                  <span>
                    <IonButton
                      shape="round"
                      data-testid="share-identity-share-button"
                      onClick={async () => {
                        await Share.share({
                          text: name + " " + id,
                        });
                      }}
                    >
                      <IonIcon
                        slot="icon-only"
                        icon={openOutline}
                      />
                    </IonButton>
                  </span>
                  <span className="share-identity-info-block-data">
                    {i18n.t("shareidentity.more")}
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

export { ShareIdentity };
