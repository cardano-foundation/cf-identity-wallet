import { IonButton, IonIcon } from "@ionic/react";
import { copyOutline, scanOutline } from "ionicons/icons";
import { QRCode } from "react-qrcode-logo";
import { useState, useEffect } from "react";
import { i18n } from "../../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { setToastMsg } from "../../../../store/reducers/stateCache";
import { ToastMsgType } from "../../../globals/types";
import { writeToClipboard } from "../../../utils/clipboard";
import { PageHeader } from "../../PageHeader";
import { Spinner } from "../../Spinner";
import { SpinnerConverage } from "../../Spinner/Spinner.type";
import { ResponsivePageLayout } from "../../layout/ResponsivePageLayout";
import { IdentifierStage1BodyProps } from "../CreateGroupIdentifier.types";
import { CreationStatus } from "../../../../core/agent/services/identifier.types";
import { getIdentifiersCache } from "../../../../store/reducers/identifiersCache";

const SetupConnectionBodyInit = ({
  componentId,
  groupMetadata,
  handleDone,
  oobi,
  handleScanButton,
}: IdentifierStage1BodyProps) => {
  const dispatch = useAppDispatch();
  const identifiers = useAppSelector(getIdentifiersCache);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    const filteredIdentifiers = Object.values(identifiers).filter(
      (item) => item.groupMetadata?.groupId === groupMetadata?.groupId
    );

    if (filteredIdentifiers[0]?.creationStatus === CreationStatus.COMPLETE) {
      setIsPending(false);
    }
  }, [groupMetadata?.groupId, identifiers]);

  const copyToClipboard = () => {
    writeToClipboard(oobi);
    dispatch(setToastMsg(ToastMsgType.COPIED_TO_CLIPBOARD));
  };

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
      <p
        className="multisig-share-note"
        data-testid="multisig-share-note-top"
      >
        {i18n.t("createidentifier.share.notes.top")}
      </p>
      <div
        className={`multisig-share-qr-code${
          oobi.length && !isPending ? " reveal" : " blur"
        }`}
        data-testid="multisig-share-qr-code"
      >
        <div className="qr-container">
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
              <Spinner
                show={isPending}
                coverage={SpinnerConverage.Container}
              />
            </span>
          </span>
        </div>
        <IonButton
          shape="round"
          expand="block"
          fill="outline"
          className="copy-button secondary-button"
          data-testid={"multisig-copy-oobi-connection-button"}
          onClick={copyToClipboard}
          disabled={isPending}
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
          className="scan-button"
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

export { SetupConnectionBodyInit };
