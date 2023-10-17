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
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { copyOutline, refreshOutline, qrCodeOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { ShareQRProps } from "./ShareQR.types";
import { writeToClipboard } from "../../../utils/clipboard";
import "./ShareQR.scss";
import { blurredCryptoData, toastState } from "../../constants/dictionary";
import { useAppDispatch } from "../../../store/hooks";
import { setCurrentOperation } from "../../../store/reducers/stateCache";

const ShareQR = ({
  isOpen,
  setIsOpen,
  content,
  header,
  moreComponent,
  modalOptions,
}: ShareQRProps) => {
  const dispatch = useAppDispatch();
  const [hideDetails, setHideDetails] = useState(false);

  const refresh = async () => {
    setHideDetails(true);
    if (header.onRefresh) {
      await header.onRefresh();
      setHideDetails(false);
    }
  };
  return (
    <IonModal
      isOpen={isOpen}
      initialBreakpoint={modalOptions?.initialBreakpoint ?? 0.85}
      breakpoints={modalOptions?.breakpoints ?? [0, 0.85]}
      className="page-layout share-qr-modal"
      data-testid="share-qr-modal"
      onDidDismiss={() => setIsOpen(false)}
    >
      <div className="modal">
        <IonHeader
          translucent={true}
          className="ion-no-border"
        >
          <IonToolbar color="light">
            <IonTitle data-testid="share-qr-modal-title">
              <h2 style={{ textAlign: header.titlePosition ?? "left" }}>
                {header.title}
              </h2>
            </IonTitle>
            {header.onRefresh && (
              <IonButtons slot="primary">
                <IonButton
                  shape="round"
                  className="refresh-button"
                  data-testid="refresh-button"
                  onClick={() => refresh()}
                >
                  <IonIcon
                    slot="icon-only"
                    icon={refreshOutline}
                  ></IonIcon>
                </IonButton>
              </IonButtons>
            )}
          </IonToolbar>
        </IonHeader>

        <IonContent
          className="share-qr-modal-body"
          color="light"
        >
          <IonGrid className={hideDetails ? "hide" : ""}>
            <IonRow>
              <IonCol
                size="12"
                data-testid="share-qr-modal-qr-code"
              >
                <QRCode
                  value={content.QRData}
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
                <span className="share-qr-modal-blur-overlay-container">
                  <span className="share-qr-modal-blur-overlay-inner">
                    <IonIcon
                      slot="icon-only"
                      icon={qrCodeOutline}
                    />
                  </span>
                </span>
              </IonCol>
            </IonRow>

            {content?.copyBlock && (
              <IonRow>
                <IonCol
                  size="12"
                  className="share-qr-modal-content"
                >
                  {content?.copyBlock?.map((item, index) => {
                    return (
                      <div
                        className="share-qr-modal-info-block"
                        key={index}
                      >
                        {item.title && <h3>{item.title}</h3>}
                        <div className="share-qr-modal-info-block-inner">
                          <span
                            className="share-qr-modal-info-block-line"
                            data-testid="copy-button-type"
                            onClick={() => {
                              writeToClipboard(item.content);
                              dispatch(
                                setCurrentOperation(
                                  toastState.copiedToClipboard
                                )
                              );
                            }}
                          >
                            <span className="share-qr-modal-info-block-data">
                              {hideDetails ? blurredCryptoData : item.content}
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
                    );
                  })}
                </IonCol>
              </IonRow>
            )}
          </IonGrid>
          <div className="share-qr-modal-divider">
            <span className="share-qr-modal-divider-line" />
            <span className="share-qr-modal-divider-text">
              {i18n.t("shareqr.divider")}
            </span>
            <span className="share-qr-modal-divider-line" />
          </div>
          {moreComponent}
        </IonContent>
      </div>
    </IonModal>
  );
};

export { ShareQR };
