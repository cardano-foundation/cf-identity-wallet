import { Share } from "@capacitor/share";
import { IonButton, IonIcon } from "@ionic/react";
import { copyOutline, openOutline, qrCodeOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { Agent } from "../../../../../core/agent/agent";
import { i18n } from "../../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getStateCache,
  setToastMsg,
} from "../../../../../store/reducers/stateCache";
import { OptionModal } from "../../../../components/OptionsModal";
import { ToastMsgType } from "../../../../globals/types";
import { writeToClipboard } from "../../../../utils/clipboard";
import { ShareConnectionProps } from "./ShareConnection.types";
import "./ShareConnection.scss";

const ShareConnection = ({
  isOpen,
  onClose,
  signifyName,
}: ShareConnectionProps) => {
  const componentId = "share-connection-modal";
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const userName = stateCache.authentication.userName;
  const [oobi, setOobi] = useState("");

  useEffect(() => {
    if (signifyName) {
      const fetchOobi = async () => {
        const oobiValue = await Agent.agent.connections.getOobi(
          `${signifyName}`,
          userName
        );
        if (oobiValue) {
          setOobi(oobiValue);
        }
      };
      fetchOobi();
    }
  }, [signifyName, userName]);

  return (
    <OptionModal
      modalIsOpen={isOpen}
      componentId={componentId}
      customClasses={componentId}
      onDismiss={onClose}
      header={{
        closeButton: true,
        closeButtonLabel: `${i18n.t("shareconnection.done")}`,
        closeButtonAction: onClose,
        title: `${i18n.t("shareconnection.title")}`,
      }}
    >
      <p className="share-connection-subtitle">
        {i18n.t("shareconnection.subtitle")}
      </p>
      <div className="share-connection-body">
        <div
          className={`share-connection-body-component ${
            oobi.length ? "reveal" : "blur"
          }`}
          data-testid="share-connection-qr-code"
        >
          <div className="qr-container">
            <QRCode
              value={oobi}
              size={250}
              fgColor={"black"}
              bgColor={"white"}
              qrStyle={"squares"}
              logoImage={""} // Optional - leaving as a reminder for possible future customisation
              logoWidth={60}
              logoHeight={60}
              logoOpacity={1}
              quietZone={10}
            />
          </div>
          <span className="connection-share-qr-code-blur-overlay-container">
            <span className="connection-share-qr-code-blur-overlay-inner">
              <IonIcon
                slot="icon-only"
                icon={qrCodeOutline}
              />
            </span>
          </span>
        </div>
        <div className="share-connection-divider">
          <span className="share-connection-divider-line" />
          <span className="share-connection-divider-text">
            {i18n.t("shareconnection.divider")}
          </span>
          <span className="share-connection-divider-line" />
        </div>
        <div className="share-connection-body-component-content">
          <span
            className="share-connection-option"
            onClick={() => {
              writeToClipboard(oobi);
              dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
            }}
          >
            <span>
              <IonButton
                data-testid="share-connection-copy-button"
                shape="round"
              >
                <IonIcon
                  slot="icon-only"
                  icon={copyOutline}
                />
              </IonButton>
            </span>
            <span
              className="share-connection-label"
              data-testid="share-connection-copy-label"
            >
              {i18n.t("shareconnection.copykey")}
            </span>
          </span>
          <span
            className="share-connection-option"
            data-testid="share-connection-share-button"
            onClick={async () => {
              await Share.share({
                text: oobi,
              });
            }}
          >
            <span>
              <IonButton
                shape="round"
                data-testid="share-connection-more-button"
              >
                <IonIcon
                  slot="icon-only"
                  icon={openOutline}
                />
              </IonButton>
            </span>
            <span
              className="share-connection-info-block-data"
              data-testid="share-connection-more-label"
            >
              {i18n.t("shareconnection.more")}
            </span>
          </span>
        </div>
      </div>
    </OptionModal>
  );
};

export { ShareConnection };
