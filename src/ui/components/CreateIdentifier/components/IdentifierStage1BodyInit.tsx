import { IonIcon, IonButton } from "@ionic/react";
import { scanOutline, qrCodeOutline, copyOutline } from "ionicons/icons";
import { QRCode } from "react-qrcode-logo";
import { i18n } from "../../../../i18n";
import { PageHeader } from "../../PageHeader";
import { IdentifierStage1BodyProps } from "../CreateIdentifier.types";
import { useAppDispatch } from "../../../../store/hooks";
import { writeToClipboard } from "../../../utils/clipboard";
import { setToastMsg } from "../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../globals/types";
import { PageFooter } from "../../PageFooter";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";

const IdentifierStage1BodyInit = ({
  componentId,
  handleDone,
  oobi,
  handleScanButton,
  handleDelete,
}: IdentifierStage1BodyProps) => {
  const dispatch = useAppDispatch();
  const copyToClipboard = () => {
    writeToClipboard(oobi);
    dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
  };

  return (
    <>
      <ScrollablePageLayout
        pageId={componentId + "-content"}
        customClass="identifier-init-body"
        header={
          <PageHeader
            closeButton={true}
            closeButtonAction={handleDone}
            closeButtonLabel={`${i18n.t("createidentifier.done")}`}
            title={`${i18n.t("createidentifier.share.title")}`}
          />
        }
      >
        <p
          className="multisig-share-note"
          data-testid="multisig-share-note-top"
        >
          {i18n.t("createidentifier.share.notes.top")}
        </p>
        <div
          className={`multisig-share-qr-code${
            oobi.length ? " reveal" : " blur"
          }`}
          data-testid="multisig-share-qr-code"
        >
          <QRCode
            value={oobi}
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
          <span className="multisig-share-qr-code-blur-overlay-container">
            <span className="multisig-share-qr-code-blur-overlay-inner">
              <IonIcon
                slot="icon-only"
                icon={qrCodeOutline}
              />
            </span>
          </span>
          <IonButton
            shape="round"
            expand="block"
            fill="outline"
            className="copy-button secondary-button"
            data-testid={"multisig-copy-oobi-connection-button"}
            onClick={copyToClipboard}
          >
            {i18n.t("createidentifier.share.copybutton")}
            <IonIcon
              slot="end"
              size="small"
              icon={copyOutline}
              color="primary"
            />
          </IonButton>
        </div>
        <p
          className="multisig-share-note"
          data-testid="multisig-share-note-middle"
        >
          {i18n.t("createidentifier.share.notes.middle")}
        </p>
        <div
          className="share-identifier-scan-button"
          data-testid="share-identifier-scan-button-round"
        >
          <IonButton
            shape="round"
            color={"primary-gradient"}
            onClick={handleScanButton}
          >
            <IonIcon
              slot="icon-only"
              icon={scanOutline}
            />
          </IonButton>
        </div>
      </ScrollablePageLayout>
      <PageFooter
        pageId="initiate-multi-sig"
        deleteButtonAction={handleDelete}
        deleteButtonText={`${i18n.t("createidentifier.share.delete")}`}
      />
    </>
  );
};

export { IdentifierStage1BodyInit };
