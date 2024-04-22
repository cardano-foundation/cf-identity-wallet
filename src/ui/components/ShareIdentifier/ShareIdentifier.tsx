import { IonButton, IonCol, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { Share } from "@capacitor/share";
import { QRCode } from "react-qrcode-logo";
import { copyOutline, openOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { i18n } from "../../../i18n";
import { ShareIdentifierProps } from "./ShareIdentifier.types";
import { writeToClipboard } from "../../utils/clipboard";
import "./ShareIdentifier.scss";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getStateCache, setToastMsg } from "../../../store/reducers/stateCache";
import { ToastMsgType } from "../../globals/types";
import { Agent } from "../../../core/agent/agent";
import { PageHeader } from "../PageHeader";
import { ResponsiveModal } from "../layout/ResponsiveModal";

const ShareIdentifier = ({
  isOpen,
  setIsOpen,
  identifier,
}: ShareIdentifierProps) => {
  const componentId = "share-identifier-modal";
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const userName = stateCache.authentication.userName;
  const [oobi, setOobi] = useState("");

  useEffect(() => {
    if (identifier) {
      const fetchOobi = async () => {
        const oobiValue = await Agent.agent.connections.getKeriOobi(
          `${identifier}`,
          userName
        );
        if (oobiValue) {
          setOobi(oobiValue);
        }
      };
      fetchOobi();
    }
  }, [identifier, userName]);

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
      <p className="share-identifier-subtitle">
        {i18n.t("shareidentifier.subtitle")}
      </p>
      <div className="share-identifier-body">
        <div
          className="share-identifier-body-component"
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

export { ShareIdentifier };
