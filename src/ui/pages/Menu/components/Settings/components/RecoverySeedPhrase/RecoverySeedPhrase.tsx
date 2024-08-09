import { IonIcon } from "@ionic/react";
import { alertCircleOutline } from "ionicons/icons";
import { useCallback, useState } from "react";
import { i18n } from "../../../../../../../i18n";
import { PageFooter } from "../../../../../../components/PageFooter";
import { SeedPhraseModule } from "../../../../../../components/SeedPhraseModule";
import "./RecoverySeedPhrase.scss";
import { CardDetailsBlock } from "../../../../../../components/CardDetails";
import { ConfirmModal } from "./ConfirmModal";
import { Agent } from "../../../../../../../core/agent/agent";
import { useOnlineStatusEffect } from "../../../../../../hooks";

const RecoverySeedPhrase = () => {
  const componentId = "recovery-seed-phrase";
  const [seedPhrase, setSeedPhrase] = useState<string[]>(Array(18).fill(""));
  const [hideSeedPhrase, setHideSeedPhrase] = useState(true);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const footerButtonLabel = hideSeedPhrase
    ? i18n.t("settings.sections.security.seedphrase.page.button.view")
    : i18n.t("settings.sections.security.seedphrase.page.button.hide");

  const loadSeedPhrase = useCallback(async () => {
    try {
      const data = await Agent.agent.getMnemonic();
      setSeedPhrase(data.split(" "));
    } catch (e) {
      // TODO: Handle error
    }
  }, []);

  useOnlineStatusEffect(loadSeedPhrase);

  const handleClickPrimaryButton = () => {
    if (!hideSeedPhrase) {
      return setHideSeedPhrase(true);
    }

    setOpenConfirmModal(true);
  };

  const showPhrase = () => {
    setOpenConfirmModal(false);
    setHideSeedPhrase(false);
  };

  return (
    <>
      <div className="recovery-page-container">
        <CardDetailsBlock className="user-tips">
          <div>
            <p>
              {i18n.t("settings.sections.security.seedphrase.page.tips.label")}
            </p>
            <ol className="tips">
              <li>
                {i18n.t("settings.sections.security.seedphrase.page.tips.one")}
              </li>
              <li>
                {i18n.t("settings.sections.security.seedphrase.page.tips.two")}
              </li>
              <li>
                {i18n.t(
                  "settings.sections.security.seedphrase.page.tips.three"
                )}
              </li>
            </ol>
          </div>
          <div className="alert-icon">
            <IonIcon
              icon={alertCircleOutline}
              slot="icon-only"
            />
          </div>
        </CardDetailsBlock>
        <SeedPhraseModule
          testId="seed-phrase-container"
          seedPhrase={seedPhrase}
          overlayText={`${i18n.t(
            "settings.sections.security.seedphrase.page.hiddentext"
          )}`}
          hideSeedPhrase={hideSeedPhrase}
          setHideSeedPhrase={setHideSeedPhrase}
          showSeedPhraseButton={false}
        />
      </div>
      <PageFooter
        customClass="recovery-seed-phrase-page-footer"
        pageId={componentId}
        primaryButtonText={`${footerButtonLabel}`}
        primaryButtonAction={handleClickPrimaryButton}
      />
      <ConfirmModal
        isOpen={openConfirmModal}
        setIsOpen={setOpenConfirmModal}
        onShowPhrase={showPhrase}
      />
    </>
  );
};

export { RecoverySeedPhrase };
