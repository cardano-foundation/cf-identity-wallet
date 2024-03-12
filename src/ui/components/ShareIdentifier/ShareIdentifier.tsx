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
import { ShareIdentifierProps } from "./ShareIdentifier.types";
import { writeToClipboard } from "../../utils/clipboard";
import "./ShareIdentifier.scss";
import { useAppDispatch } from "../../../store/hooks";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";

const ShareIdentifier = ({
  isOpen,
  setIsOpen,
  id,
  name,
}: ShareIdentifierProps) => {
  const dispatch = useAppDispatch();

  return (
    <IonModal
      isOpen={isOpen}
      initialBreakpoint={0.66}
      breakpoints={[0, 0.66]}
      className="page-layout share-identifier"
      data-testid="share-identifier-modal"
      onDidDismiss={() => setIsOpen(false)}
    >
      <div className="modal">
        <IonHeader
          translucent={true}
          className="ion-no-border"
        >
          <IonToolbar color="light">
            <IonTitle data-testid="share-identifier-title">
              <h2>{i18n.t("shareidentifier.title")}</h2>
            </IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent
          className="share-identifier-body"
          color="light"
        >
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <QRCode
                  data-testid="share-identifier-qr-code"
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
          <div className="share-identifier-divider">
            <span className="share-identifier-divider-line" />
            <span className="share-identifier-divider-text">
              {i18n.t("shareidentifier.divider")}
            </span>
            <span className="share-identifier-divider-line" />
          </div>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <span
                  className="share-identifier-option"
                  data-testid="share-identifier-copy-button"
                  onClick={() => {
                    writeToClipboard(id);
                    dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
                  }}
                >
                  <span>
                    <IonButton shape="round">
                      <IonIcon
                        slot="icon-only"
                        icon={copyOutline}
                      />
                    </IonButton>
                  </span>
                  <span className="share-identifier-label">
                    {i18n.t("shareidentifier.copykey")}
                  </span>
                </span>
                <span
                  className="share-identifier-option"
                  data-testid="share-identifier-share-button"
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
                  <span className="share-identifier-info-block-data">
                    {i18n.t("shareidentifier.more")}
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

export { ShareIdentifier };
