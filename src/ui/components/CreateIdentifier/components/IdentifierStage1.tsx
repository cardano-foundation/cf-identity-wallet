import { useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { IonButton, IonIcon } from "@ionic/react";
import { scanOutline } from "ionicons/icons";
import { i18n } from "../../../../i18n";
import { PageHeader } from "../../PageHeader";
import { ScrollablePageLayout } from "../../layout/ScrollablePageLayout";
import { IdentifierStageProps } from "../CreateIdentifier.types";
import { ConnectionShortDetails } from "../../../pages/Connections/Connections.types";
import { useAppSelector } from "../../../../store/hooks";
import { getConnectionsCache } from "../../../../store/reducers/connectionsCache";
import { ResponsivePageLayout } from "../../layout/ResponsivePageLayout";
import { getStateCache } from "../../../../store/reducers/stateCache";
import { Agent } from "../../../../core/agent/agent";

const IdentifierStage1 = ({
  state,
  setState,
  componentId,
  resetModal,
  resumeMultiSig,
}: IdentifierStageProps) => {
  const stateCache = useAppSelector(getStateCache);
  const userName = stateCache.authentication.userName;
  const [oobi, setOobi] = useState("");
  const identifierId = resumeMultiSig?.id || state.newIdentifier.id;
  const groupIdFromIdentifier =
    resumeMultiSig?.groupMetadata?.groupId ||
    state.newIdentifier.groupMetadata?.groupId;

  useEffect(() => {
    const fetchOobi = async () => {
      const oobiValue = await Agent.agent.connections.getKeriOobi(
        identifierId,
        userName,
        groupIdFromIdentifier
      );
      if (oobiValue) {
        setOobi(oobiValue);
      }
    };
    fetchOobi();
  }, [userName]);

  const handleDone = () => {
    // setState((prevState: IdentifierStageProps) => ({
    //   ...prevState,
    //   identifierCreationStage: 2,
    //   selectedConnections: selectedConnections,
    // }));
    // TODO: Save the identifier to the state cache and reset the modal
    resetModal && resetModal();
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
        <p className="multisig-subtitle">
          {i18n.t("createidentifier.share.footnote")}
        </p>
        <div className="share-identifier-scan-button">
          <IonButton
            shape="round"
            color={"primary-gradient"}
            onClick={() => console.log("Scan button clicked")}
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
