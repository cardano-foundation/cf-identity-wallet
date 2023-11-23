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
import { QRCode } from "react-qrcode-logo";
import { copyOutline, openOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { ShareIdentityProps } from "./ShareIdentity.types";
import { writeToClipboard } from "../../utils/clipboard";
import "./ShareIdentity.scss";

const ShareIdentity = ({ isOpen, setIsOpen, id, name }: ShareIdentityProps) => {
  return (
    <IonModal
      isOpen={isOpen}
      initialBreakpoint={0.66}
      breakpoints={[0, 0.66]}
      className="page-layout share-identity"
      data-testid="share-identity-modal"
      onDidDismiss={() => setIsOpen(false)}
    >
      <div className="modal">
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
                <QRCode
                  data-testid="share-identity-qr-code"
                  value={id}
                  size={250}
                  fgColor={"black"}
                  bgColor={"white"}
                  qrStyle={"squares"}
                  logoImage={""} // Optional
                  logoWidth={60}
                  logoHeight={60}
                  logoOpacity={1}
                  quietZone={10}
                />
              </IonCol>
            </IonRow>
          </IonGrid>
          <div className="share-identity-divider">
            <span className="share-identity-divider-line" />
            <span className="share-identity-divider-text">
              {i18n.t("shareidentity.divider")}
            </span>
            <span className="share-identity-divider-line" />
          </div>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <span
                  className="share-identity-option"
                  data-testid="share-identity-copy-button"
                  onClick={() => writeToClipboard(id)}
                >
                  <span>
                    <IonButton shape="round">
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
                <span
                  className="share-identity-option"
                  data-testid="share-identity-share-button"
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
