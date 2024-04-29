import { IonIcon, IonButton, IonItem, IonLabel, IonList } from "@ionic/react";
import { qrCodeOutline } from "ionicons/icons";
import { QRCode } from "react-qrcode-logo";
import { useEffect, useState } from "react";
import { i18n } from "../../../../i18n";
import { PageHeader } from "../../PageHeader";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";
import { IdentifierStage1BodyProps } from "../CreateIdentifier.types";
import { ConnectionShortDetails } from "../../../../core/agent/agent.types";
import KeriLogo from "../../../assets/images/KeriGeneric.jpg";
import { PageFooter } from "../../PageFooter";
import { Agent } from "../../../../core/agent/agent";

const IdentifierStage1BodyResume = ({
  componentId,
  handleDone,
  handleInitiateMultiSig,
  oobi,
  groupMetadata,
  handleScanButton,
}: IdentifierStage1BodyProps) => {
  const [scannedConections, setScannedConnections] = useState<
    ConnectionShortDetails[]
  >([]);

  useEffect(() => {
    if (groupMetadata?.groupId) {
      const updateConnections = async () => {
        const connections =
          await Agent.agent.connections.getMultisigLinkedContacts(
            groupMetadata?.groupId
          );

        const sortedConnections = connections.sort(function (a, b) {
          const textA = a.label.toUpperCase();
          const textB = b.label.toUpperCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        });

        setScannedConnections(sortedConnections);
      };

      updateConnections();
    }
  }, [groupMetadata]);

  return (
    <>
      <ScrollablePageLayout
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
            expand="block"
            fill="outline"
            className="secondary-button"
            onClick={handleScanButton}
          >
            {i18n.t("createidentifier.share.scanbutton")}
          </IonButton>
        </div>
        <h3>{i18n.t("createidentifier.share.subtitle")}</h3>
        {!scannedConections.length ? (
          <p className="multisig-share-note multisig-share-note-footer">
            {i18n.t("createidentifier.share.notes.bottom")}
          </p>
        ) : (
          <IonList>
            {scannedConections.map((connection, index) => {
              return (
                <IonItem key={index}>
                  <IonLabel className="connection-item">
                    <img
                      src={connection?.logo || KeriLogo}
                      className="connection-logo"
                      data-testid="identifier-stage-1-logo"
                      alt="connection-logo"
                    />
                    <span className="connection-name">{connection.label}</span>
                  </IonLabel>
                </IonItem>
              );
            })}
          </IonList>
        )}
      </ScrollablePageLayout>
      {groupMetadata?.groupInitiator && (
        <PageFooter
          pageId={componentId}
          primaryButtonText={`${i18n.t(
            "createidentifier.share.initiatebutton"
          )}`}
          primaryButtonAction={handleInitiateMultiSig}
          primaryButtonDisabled={!scannedConections.length}
        />
      )}
    </>
  );
};

export { IdentifierStage1BodyResume };
