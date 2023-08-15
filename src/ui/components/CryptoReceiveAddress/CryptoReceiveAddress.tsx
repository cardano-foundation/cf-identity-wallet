import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonModal,
  IonRow,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { Share } from "@capacitor/share";
import { QRCode } from "react-qrcode-logo";
import { copyOutline, openOutline, refreshOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { CryptoReceiveAddressProps } from "./CryptoReceiveAddress.types";
import { writeToClipboard } from "../../../utils/clipboard";
import "./CryptoReceiveAddress.scss";

const CryptoReceiveAddress = ({
  isOpen,
  setIsOpen,
  accountData,
}: CryptoReceiveAddressProps) => {
  const [showToast, setShowToast] = useState(false);
  return (
    <IonModal
      isOpen={isOpen}
      initialBreakpoint={0.8}
      breakpoints={[0, 0.8]}
      className="page-layout receive-crypto-modal"
      data-testid="receive-crypto-modal"
      onDidDismiss={() => setIsOpen(false)}
    >
      <div className="modal">
        <IonHeader
          translucent={true}
          className="ion-no-border"
        >
          <IonToolbar color="light">
            <IonTitle data-testid="receive-crypto-modal-title">
              <h2>{i18n.t("crypto.receivemodal.title")}</h2>
            </IonTitle>
            <IonButtons slot="primary">
              <IonButton
                shape="round"
                className="refresh-button"
              >
                <IonIcon
                  slot="icon-only"
                  icon={refreshOutline}
                ></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent
          className="receive-crypto-modal-body"
          color="light"
        >
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <QRCode
                  data-testid="receive-crypto-modal-qr-code"
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
              <IonCol
                size="12"
                className="receive-crypto-modal-content"
              >
                <div className="receive-crypto-modal-info-block">
                  <div className="receive-crypto-modal-info-block-inner">
                    <span
                      className="receive-crypto-modal-info-block-line"
                      data-testid="copy-button-type"
                      onClick={() => {
                        writeToClipboard(accountData.address);
                        setShowToast(true);
                      }}
                    >
                      <span className="receive-crypto-modal-info-block-data">
                        {accountData.address.substring(0, 22)}...
                      </span>
                      <span>
                        <IonButton
                          shape="round"
                          className="copy-button"
                        >
                          <IonIcon
                            slot="icon-only"
                            icon={copyOutline}
                          />
                        </IonButton>
                      </span>
                    </span>
                  </div>
                </div>
                <div className="receive-crypto-modal-info-block">
                  <h3>{i18n.t("crypto.receivemodal.derivationpath")}</h3>
                  <div className="receive-crypto-modal-info-block-inner">
                    <span
                      className="receive-crypto-modal-info-block-line"
                      data-testid="copy-button-type"
                      onClick={() => {
                        writeToClipboard(accountData.derivationPath);
                        setShowToast(true);
                      }}
                    >
                      <span className="receive-crypto-modal-info-block-data">
                        {accountData.derivationPath}
                      </span>
                      <span>
                        <IonButton
                          shape="round"
                          className="copy-button"
                        >
                          <IonIcon
                            slot="icon-only"
                            icon={copyOutline}
                          />
                        </IonButton>
                      </span>
                    </span>
                  </div>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
          <div className="receive-crypto-modal-divider">
            <span className="receive-crypto-modal-divider-line" />
            <span className="receive-crypto-modal-divider-text">
              {i18n.t("crypto.receivemodal.divider")}
            </span>
            <span className="receive-crypto-modal-divider-line" />
          </div>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <span
                  className="receive-crypto-modal-option"
                  data-testid="receive-crypto-modal-share-button"
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
                  <span className="receive-crypto-modal-info-block-data">
                    {i18n.t("crypto.receivemodal.more")}
                  </span>
                </span>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </div>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={`${i18n.t("crypto.receivemodal.toast.clipboard")}`}
        color="secondary"
        position="top"
        cssClass="confirmation-toast"
        duration={1500}
      />
    </IonModal>
  );
};

export { CryptoReceiveAddress };
