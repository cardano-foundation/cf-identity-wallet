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
import { CryptoReceiveAddressProps } from "./CryptoReceiveAddress.types";
import { writeToClipboard } from "../../../utils/clipboard";
import "./CryptoReceiveAddress.scss";

const CryptoReceiveAddress = ({
  isOpen,
  setIsOpen,
  accountData,
}: CryptoReceiveAddressProps) => {
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
              <h2>{i18n.t("crypto.receivemodal.title")}</h2>
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
                  value={accountData.address}
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
            <IonRow>
              <IonCol size="12">
                <span
                  className="share-identity-option"
                  data-testid="share-identity-copy-button"
                  onClick={() => writeToClipboard(accountData.address)}
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
                    {i18n.t("crypto.receivemodal.copykey")}
                  </span>
                </span>
              </IonCol>
            </IonRow>
          </IonGrid>
          <div className="share-identity-divider">
            <span className="share-identity-divider-line" />
            <span className="share-identity-divider-text">
              {i18n.t("crypto.receivemodal.divider")}
            </span>
            <span className="share-identity-divider-line" />
          </div>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <span
                  className="share-identity-option"
                  data-testid="share-identity-share-button"
                  onClick={async () => {
                    await Share.share({
                      text: accountData.address,
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
                    {i18n.t("crypto.receivemodal.more")}
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

export { CryptoReceiveAddress };
