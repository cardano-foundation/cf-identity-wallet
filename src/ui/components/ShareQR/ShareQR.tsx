import { IonButton, IonIcon } from "@ionic/react";
import { useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { copyOutline, refreshOutline, qrCodeOutline } from "ionicons/icons";
import { i18n } from "../../../i18n";
import { ShareQRProps } from "./ShareQR.types";
import { writeToClipboard } from "../../utils/clipboard";
import "./ShareQR.scss";
import { ToastMsgType } from "../../globals/types";
import { useAppDispatch } from "../../../store/hooks";
import { setToastMsg } from "../../../store/reducers/stateCache";
import { OptionModal } from "../OptionsModal";
import { PageHeaderProps } from "../PageHeader/PageHeader.types";
import { combineClassNames } from "../../utils/style";

const ShareQR = ({
  isOpen,
  setIsOpen,
  content,
  header,
  moreComponent,
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

  const handleClose = () => setIsOpen(false);

  const headerOptions: PageHeaderProps = {
    title: header.title,
    actionButton: !!header.onRefresh,
    actionButtonIcon: refreshOutline,
    actionButtonAction: refresh,
  };

  const contentClass = combineClassNames("share-qr-code", {
    hide: hideDetails,
  });

  return (
    <OptionModal
      modalIsOpen={isOpen}
      componentId="share-qr-modal"
      customClasses="share-qr-modal"
      onDismiss={handleClose}
      header={headerOptions}
    >
      <div className="share-modal-content">
        <div className={contentClass}>
          <div
            data-testid="share-qr-modal-qr-code"
            className="share-qr-modal-blur-overlay-container"
          >
            <QRCode
              value={content.QRData}
              size={200}
              fgColor={"black"}
              bgColor={"white"}
              qrStyle={"squares"}
              logoImage={""} // Optional
              logoWidth={60}
              logoHeight={60}
              logoOpacity={1}
              quietZone={10}
            />
            <span className="share-qr-modal-blur-overlay-inner">
              <IonIcon
                slot="icon-only"
                icon={qrCodeOutline}
              />
            </span>
          </div>
          {content?.copyBlock && (
            <div className="qr-infos">
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
                            setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD)
                          );
                        }}
                      >
                        <span className="share-qr-modal-info-block-data">
                          {hideDetails ? "••••••••••••••••••" : item.content}
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
            </div>
          )}
        </div>
        <div className="share-qr-modal-divider">
          <span className="share-qr-modal-divider-line" />
          <span className="share-qr-modal-divider-text">
            {i18n.t("shareqr.divider")}
          </span>
          <span className="share-qr-modal-divider-line" />
        </div>
        {moreComponent}
      </div>
    </OptionModal>
  );
};

export { ShareQR };
