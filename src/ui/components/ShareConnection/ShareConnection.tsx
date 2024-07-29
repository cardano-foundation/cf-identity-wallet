import { Share } from "@capacitor/share";
import { IonButton, IonIcon } from "@ionic/react";
import { copyOutline, openOutline, qrCodeOutline } from "ionicons/icons";
import { useCallback, useMemo, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { Agent } from "../../../core/agent/agent";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getStateCache, setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { useOnlineStatusEffect } from "../../hooks";
import { writeToClipboard } from "../../utils/clipboard";
import { PageHeader } from "../PageHeader";
import { ResponsiveModal } from "../layout/ResponsiveModal";
import "./ShareConnection.scss";
import { ShareConnectionProps, ShareType } from "./ShareConnection.types";
import "./ShareIdentifier.scss";

const ShareConnection = ({
  isOpen,
  setIsOpen,
  signifyName,
  shareType: shareLocation = ShareType.Identifier,
}: ShareConnectionProps) => {
  const componentId = "share-identifier-modal";
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const userName = stateCache.authentication.userName;
  const [oobi, setOobi] = useState("");

  const fetchOobi = useCallback(async () => {
    if (!signifyName) return;

    const oobiValue = await Agent.agent.connections.getOobi(
      `${signifyName}`,
      userName
    );
    if (oobiValue) {
      setOobi(oobiValue);
    }
  }, [signifyName, userName]);

  const subtitle = useMemo(() => {
    switch (shareLocation) {
    case ShareType.Connection:
      return i18n.t("shareidentifier.subtitle.connection");
    default:
      return i18n.t("shareidentifier.subtitle.identifier");
    }
  }, [shareLocation]);

  useOnlineStatusEffect(fetchOobi);

  return (
    <ResponsiveModal
      modalIsOpen={isOpen}
      componentId={componentId}
      customClasses={componentId}
      onDismiss={() => setIsOpen(false)}
    >
      <PageHeader
        closeButton={true}
        closeButtonLabel={`${i18n.t("shareidentifier.done")}`}
        closeButtonAction={() => setIsOpen(false)}
        title={`${i18n.t("shareidentifier.title")}`}
      />
      <p className="share-identifier-subtitle">{subtitle}</p>
      <div className="share-identifier-body">
        <div
          className={`share-identifier-body-component share-qr ${
            oobi ? "reveal" : "blur"
          }`}
          data-testid="share-identifier-qr-code"
        >
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
          <span className="share-qr-code-blur-overlay-container">
            <span className="share-qr-code-blur-overlay-inner">
              <IonIcon
                slot="icon-only"
                icon={qrCodeOutline}
              />
            </span>
          </span>
        </div>
        <div className="share-identifier-divider">
          <span className="share-identifier-divider-line" />
          <span className="share-identifier-divider-text">
            {i18n.t("shareidentifier.divider")}
          </span>
          <span className="share-identifier-divider-line" />
        </div>
        <div className="share-identifier-body-component">
          <span
            className="share-identifier-option"
            onClick={() => {
              writeToClipboard(oobi);
              dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
            }}
          >
            <span>
              <IonButton
                data-testid="share-identifier-copy-button"
                shape="round"
              >
                <IonIcon
                  slot="icon-only"
                  icon={copyOutline}
                />
              </IonButton>
            </span>
            <span
              className="share-identifier-label"
              data-testid="share-identifier-copy-label"
            >
              {i18n.t("shareidentifier.copykey")}
            </span>
          </span>
          <span
            className="share-identifier-option"
            data-testid="share-identifier-share-button"
            onClick={async () => {
              await Share.share({
                text: oobi,
              });
            }}
          >
            <span>
              <IonButton
                shape="round"
                data-testid="share-identifier-more-button"
              >
                <IonIcon
                  slot="icon-only"
                  icon={openOutline}
                />
              </IonButton>
            </span>
            <span
              className="share-identifier-info-block-data"
              data-testid="share-identifier-more-label"
            >
              {i18n.t("shareidentifier.more")}
            </span>
          </span>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export { ShareConnection };
