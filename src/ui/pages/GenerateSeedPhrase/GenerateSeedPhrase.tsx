import { useEffect, useState } from "react";
import { IonCheckbox } from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./GenerateSeedPhrase.scss";
import { Trans } from "react-i18next";
import { i18n } from "../../../i18n";
import { Alert as AlertConfirm } from "../../components/Alert";
import { getStateCache } from "../../../store/reducers/stateCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateReduxState } from "../../../store/utils";
import { RoutePath } from "../../../routes";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { getSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../components/PageHeader";
import { PageFooter } from "../../components/PageFooter";
import { SeedPhraseModule } from "../../components/SeedPhraseModule";
import { TermsModal } from "../../components/TermsModal";
import { useAppIonRouter } from "../../hooks";
import { Agent } from "../../../core/agent/agent";
import { BranAndMnemonic } from "../../../core/agent/agent.types";

const GenerateSeedPhrase = () => {
  const pageId = "generate-seed-phrase";
  const ionRouter = useAppIonRouter();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const seedPhraseStore = useAppSelector(getSeedPhraseCache);
  const [brandNMnemonic, setBrandNMnemonic] = useState<BranAndMnemonic>();
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [hideSeedPhrase, setHideSeedPhrase] = useState(true);
  const [alertConfirmIsOpen, setAlertConfirmIsOpen] = useState(false);
  const [termsModalIsOpen, setTermsModalIsOpen] = useState(false);
  const [privacyModalIsOpen, setPrivacyModalIsOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  const initializeSeedPhrase = async () => {
    setHideSeedPhrase(true);
    if (seedPhraseStore.seedPhrase.length > 0) {
      setSeedPhrase(seedPhraseStore.seedPhrase.split(" "));
      setBrandNMnemonic({
        mnemonic: seedPhraseStore.seedPhrase,
        bran: seedPhraseStore.bran,
      });
    } else {
      const branAndMnemonic = await Agent.agent.getBranAndMnemonic();
      setSeedPhrase(branAndMnemonic.mnemonic.split(" "));
      setBrandNMnemonic(branAndMnemonic);
    }
  };

  useEffect(() => {
    if (history?.location.pathname === RoutePath.GENERATE_SEED_PHRASE) {
      initializeSeedPhrase();
    }
  }, [history?.location.pathname]);

  const handleClearState = () => {
    setSeedPhrase([]);
    initializeSeedPhrase();
    setHideSeedPhrase(false);
    setAlertConfirmIsOpen(false);
    setChecked(false);
  };

  const HandleTerms = () => {
    return (
      <u
        data-testid="terms-of-use-modal-handler"
        onClick={() => setTermsModalIsOpen(true)}
      >
        {i18n.t("generateseedphrase.termsandconditions.terms")}
      </u>
    );
  };

  const handleContinue = () => {
    setAlertConfirmIsOpen(false);
    const data: DataProps = {
      store: { stateCache },
      state: {
        seedPhrase: brandNMnemonic?.mnemonic,
        bran: brandNMnemonic?.bran,
      },
    };
    const { nextPath, updateRedux } = getNextRoute(
      RoutePath.GENERATE_SEED_PHRASE,
      data
    );
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    handleClearState();
    ionRouter.push(nextPath.pathname, "forward", "push");
  };

  return (
    <ScrollablePageLayout
      pageId={pageId}
      header={
        <PageHeader
          backButton={true}
          beforeBack={handleClearState}
          currentPath={RoutePath.GENERATE_SEED_PHRASE}
          progressBar={true}
          progressBarValue={0.75}
          progressBarBuffer={1}
        />
      }
    >
      <h2 data-testid={`${pageId}-title`}>
        {i18n.t("generateseedphrase.onboarding.title")}
      </h2>
      <p data-testid={`${pageId}-paragraph-top`}>
        {i18n.t("generateseedphrase.onboarding.paragraph.top")}
      </p>
      <SeedPhraseModule
        testId="seed-phrase-container"
        seedPhrase={seedPhrase}
        hideSeedPhrase={hideSeedPhrase}
        setHideSeedPhrase={setHideSeedPhrase}
      />
      <p data-testid={`${pageId}-paragraph-bottom`}>
        {i18n.t("generateseedphrase.onboarding.paragraph.bottom")}
      </p>
      <div className="terms-and-conditions">
        <IonCheckbox
          labelPlacement="end"
          data-testid="terms-and-conditions-checkbox"
          checked={checked}
          onIonChange={(event) => setChecked(event.detail.checked)}
        />
        <p>
          <Trans
            i18nKey={i18n.t("generateseedphrase.termsandconditions.text")}
            components={[<HandleTerms key="" />]}
          />
        </p>
      </div>
      <TermsModal
        name="terms-of-use"
        isOpen={termsModalIsOpen}
        setIsOpen={setTermsModalIsOpen}
      />
      <TermsModal
        name="privacy-policy"
        isOpen={privacyModalIsOpen}
        setIsOpen={setPrivacyModalIsOpen}
      />
      <PageFooter
        pageId={pageId}
        primaryButtonText={`${i18n.t(
          "generateseedphrase.onboarding.button.continue"
        )}`}
        primaryButtonAction={() => {
          setAlertConfirmIsOpen(true);
        }}
        primaryButtonDisabled={hideSeedPhrase || !checked}
      />
      <AlertConfirm
        isOpen={alertConfirmIsOpen}
        setIsOpen={setAlertConfirmIsOpen}
        dataTestId="seed-phrase-generate-alert-continue"
        headerText={i18n.t("generateseedphrase.alert.confirm.text")}
        confirmButtonText={`${i18n.t(
          "generateseedphrase.alert.confirm.button.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "generateseedphrase.alert.confirm.button.cancel"
        )}`}
        actionConfirm={handleContinue}
      />
    </ScrollablePageLayout>
  );
};

export { GenerateSeedPhrase };
