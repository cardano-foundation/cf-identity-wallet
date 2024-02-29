import { ShareOOBIProps } from "./ShareOOBI.types";
import "./ShareOOBI.scss";
import { ResponsiveModal } from "../../../../components/layout/ResponsiveModal";
import { PageHeader } from "../../../../components/PageHeader";
import { QRCode } from "react-qrcode-logo";
import { IonIcon, IonButton } from "@ionic/react";
import { copyOutline } from "ionicons/icons";
import { writeToClipboard } from "../../../../utils/clipboard";
import { setToastMsg } from "../../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../../globals/types";
import { useAppDispatch } from "../../../../../store/hooks";

const ShareOOBI = ({
  modalIsOpen,
  setModalIsOpen,
  content,
  name,
}: ShareOOBIProps) => {
  const componentId = "share-oobi-modal";
  const dispatch = useAppDispatch();

  const resetModal = () => {
    setModalIsOpen(false);
  };

  const handleCopyContent = () => {
    writeToClipboard(content);
    dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
  };

  return (
    <ResponsiveModal
      componentId={componentId}
      modalIsOpen={modalIsOpen}
      onDismiss={() => resetModal()}
    >
      <>
        <PageHeader
          closeButton={true}
          closeButtonLabel="Close"
          closeButtonAction={() => resetModal()}
          title={`Share ${name} OOBI`}
        />
        <div className="qr-container">
          <div className="text-explanation">
            Scan this QR code with the Tunnel extension
          </div>
          <QRCode
            value={content}
            size={250}
            fgColor={"black"}
            bgColor={"white"}
            qrStyle={"squares"}
            logoImage={""}
            logoWidth={60}
            logoHeight={60}
            logoOpacity={1}
            quietZone={10}
          />
          <div className="qr-content">
            <p className="qr-content-text">{content}</p>
            <IonButton
              fill="clear"
              onClick={handleCopyContent}
            >
              Copy to clipboard
              <IonIcon icon={copyOutline} />
            </IonButton>
          </div>
        </div>
      </>
    </ResponsiveModal>
  );
};

export { ShareOOBI };
