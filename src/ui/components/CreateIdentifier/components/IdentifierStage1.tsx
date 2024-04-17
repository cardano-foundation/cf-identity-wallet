import { useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { IonButton, IonIcon } from "@ionic/react";
import { scanOutline, qrCodeOutline } from "ionicons/icons";
import { i18n } from "../../../../i18n";
import { PageHeader } from "../../PageHeader";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { useAppSelector } from "../../../../store/hooks";
import { ResponsivePageLayout } from "../../layout/ResponsivePageLayout";
import { getStateCache } from "../../../../store/reducers/stateCache";
import { Agent } from "../../../../core/agent/agent";

const IdentifierStage1 = ({
  state,
  componentId,
  resetModal,
  resumeMultiSig,
}: IdentifierStageProps) => {
  const stateCache = useAppSelector(getStateCache);
  const userName = stateCache.authentication.userName;
  const [oobi, setOobi] = useState("");
  const signifyName =
    resumeMultiSig?.signifyName || state.newIdentifier.signifyName;
  const groupId =
    resumeMultiSig?.groupMetadata?.groupId ||
    state.newIdentifier.groupMetadata?.groupId;

  useEffect(() => {
    async function fetchOobi() {
      try {
        const oobiValue = await Agent.agent.connections.getKeriOobi(
          signifyName,
          userName,
          groupId
        );
        if (oobiValue) {
          setOobi(oobiValue);
        }
      } catch (e) {
        // @TODO - Error handling.
      }
    }

    fetchOobi();
  }, [groupId, signifyName, userName]);

  const handleDone = () => {
    resetModal && resetModal();
  };

  const handleScanButton = () => {
    // TODO: scan button functionality
  };

  return (
    <>
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
        <p className="multisig-subtitle">
          {i18n.t("createidentifier.share.subtitle")}
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
        <p className="multisig-subtitle">
          {i18n.t("createidentifier.share.footnote")}
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
    </>
  );
};

export { IdentifierStage1 };
