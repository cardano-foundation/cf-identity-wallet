import { IonIcon, IonButton } from "@ionic/react";
import { scanOutline, qrCodeOutline } from "ionicons/icons";
import { QRCode } from "react-qrcode-logo";
import { i18n } from "../../../../i18n";
import { PageHeader } from "../../PageHeader";
import { ResponsivePageLayout } from "../../layout/ResponsivePageLayout";
import { IdentifierStage1BodyProps } from "../CreateIdentifier.types";

const IdentifierStage1BodyInit = ({
  componentId,
  handleDone,
  oobi,
  handleScanButton,
  groupMetadata,
}: IdentifierStage1BodyProps) => {
  return (
    <ResponsivePageLayout
      pageId={componentId + "-content"}
      header={
        <PageHeader
          closeButton={true}
          closeButtonAction={handleDone}
          closeButtonLabel={`${i18n.t("createidentifier.done")}`}
          title={`${i18n.t("createidentifier.share.title")}`}
        />
      }
    >
      <p className="multisig-share-note">
        {i18n.t(
          groupMetadata?.groupInitiator
            ? "createidentifier.share.notes.top"
            : "createidentifier.receive.notes.top"
        )}
      </p>
      <div
        className={`multisig-share-qr-code${oobi.length ? " reveal" : " blur"}`}
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
      </div>
      <p className="multisig-share-note">
        {i18n.t(
          groupMetadata?.groupInitiator
            ? "createidentifier.share.notes.middle"
            : "createidentifier.receive.notes.middle"
        )}
      </p>
      <div className="share-identifier-scan-button">
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
    </ResponsivePageLayout>
  );
};

export { IdentifierStage1BodyInit };
