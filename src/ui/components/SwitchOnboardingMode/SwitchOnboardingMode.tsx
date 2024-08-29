import { IonButton, IonCheckbox, IonIcon, IonModal } from "@ionic/react";
import { swapHorizontalOutline } from "ionicons/icons";
import { useState } from "react";
import { Trans } from "react-i18next";
import { i18n } from "../../../i18n";
import {
  OnboardingMode,
  SwitchOnboardingModeProps,
} from "./SwitchOnboardingMode.types";
import "./SwitchOnboardingMode.scss";
import { ScrollablePageLayout } from "../layout/ScrollablePageLayout";
import { PageHeader } from "../PageHeader";
import { CardDetailsBlock } from "../CardDetails";
import { PageFooter } from "../PageFooter";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import { Agent } from "../../../core/agent/agent";
import { BasicRecord } from "../../../core/agent/records";
import { MiscRecordId } from "../../../core/agent/agent.types";
import { useAppIonRouter } from "../../hooks";
import { RoutePath } from "../../../routes";
import {
  getAuthentication,
  setAuthentication,
  setCurrentRoute,
} from "../../../store/reducers/stateCache";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { showError } from "../../utils/error";
import { ToastMsgType } from "../../globals/types";

const SwitchOnboardingMode = ({ mode }: SwitchOnboardingModeProps) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [agree, setAgree] = useState(false);
  const ionRouter = useAppIonRouter();

  const isCreateMode = mode === OnboardingMode.Create;
  const buttonLabel = !isCreateMode
    ? i18n.t("generateseedphrase.onboarding.button.switch")
    : i18n.t("verifyrecoveryseedphrase.button.switch");

  const handleContinue = async () => {
    try {
      const action = isCreateMode
        ? Agent.agent.basicStorage.deleteById(MiscRecordId.APP_RECOVERY_WALLET)
        : Agent.agent.basicStorage.createOrUpdateBasicRecord(
          new BasicRecord({
            id: MiscRecordId.APP_RECOVERY_WALLET,
            content: {
              value: String(true),
            },
          })
        );

      await Promise.all([
        SecureStorage.delete(KeyStoreKeys.SIGNIFY_BRAN),
        action,
      ]);

      dispatch(
        setAuthentication({
          ...authentication,
          recoveryWalletProgress: !isCreateMode,
        })
      );

      dispatch(
        setSeedPhraseCache({
          bran: "",
          seedPhrase: "",
        })
      );

      const nextPath = isCreateMode
        ? RoutePath.GENERATE_SEED_PHRASE
        : RoutePath.VERIFY_RECOVERY_SEED_PHRASE;

      dispatch(setCurrentRoute({ path: nextPath }));
      ionRouter.push(nextPath);
    } catch (e) {
      showError("Unable to switch onboarding mode", e);
    }
  };

  return (
    <>
      <IonButton
        onClick={() => setOpenConfirmModal(true)}
        fill="outline"
        data-testid="switch-mode-button"
        className="switch-button secondary-button"
      >
        <IonIcon
          slot="start"
          icon={swapHorizontalOutline}
        />
        {buttonLabel}
      </IonButton>
      <IonModal
        isOpen={openConfirmModal}
        className="switch-modal"
        data-testid="switch-modal"
        onDidDismiss={() => setOpenConfirmModal(false)}
      >
        <ScrollablePageLayout
          pageId="switch-modal-content"
          header={
            <PageHeader
              closeButton={true}
              closeButtonLabel={`${i18n.t("switchmodemodal.button.back")}`}
              closeButtonAction={() => setOpenConfirmModal(false)}
              title={`${i18n.t("switchmodemodal.title")}`}
            />
          }
          footer={
            <PageFooter
              pageId="switch-modal"
              primaryButtonText={`${i18n.t("switchmodemodal.button.continue")}`}
              primaryButtonAction={() => handleContinue()}
              primaryButtonDisabled={!agree}
            >
              <div className="confirm">
                <IonCheckbox
                  labelPlacement="end"
                  data-testid="confirm-checkbox"
                  className="confirm-checkbox"
                  checked={agree}
                  onIonChange={(event) => setAgree(event.detail.checked)}
                />
                <p>{i18n.t("switchmodemodal.checkbox")}</p>
              </div>
            </PageFooter>
          }
        >
          <h3 className="title">{i18n.t(`switchmodemodal.${mode}.title`)}</h3>
          <p className="paragraph-top">
            {i18n.t(`switchmodemodal.${mode}.paragraphtop`)}
          </p>
          <CardDetailsBlock className="warning">
            <ol>
              <li>
                <Trans>{i18n.t(`switchmodemodal.${mode}.warning.one`)}</Trans>
              </li>
              <li>
                <Trans>{i18n.t(`switchmodemodal.${mode}.warning.two`)}</Trans>
              </li>
              <li>
                <Trans>{i18n.t(`switchmodemodal.${mode}.warning.three`)}</Trans>
              </li>
            </ol>
          </CardDetailsBlock>
          <p className="paragraph-bottom">
            {i18n.t(`switchmodemodal.${mode}.paragraphbot`)}
          </p>
        </ScrollablePageLayout>
      </IonModal>
    </>
  );
};

export { SwitchOnboardingMode };
