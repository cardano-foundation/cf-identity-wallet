import { useEffect, useState } from "react";
import { IonCheckbox } from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./GenerateSeedPhrase.scss";
import { generateMnemonic } from "bip39";
import { Trans } from "react-i18next";
import { i18n } from "../../../i18n";
import {
  MNEMONIC_FIFTEEN_WORDS,
  FIFTEEN_WORDS_BIT_LENGTH,
  TWENTYFOUR_WORDS_BIT_LENGTH,
} from "../../globals/constants";
import { Alert as AlertConfirm } from "../../components/Alert";
import { getStateCache } from "../../../store/reducers/stateCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { TermsAndConditions as TermsAndConditionsModal } from "../../components/TermsAndConditions";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateReduxState } from "../../../store/utils";
import { RoutePath } from "../../../routes";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { getSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter/PageFooter";
import { MnemonicLengthSegment } from "../../components/MnemonicLengthSegment";
import { SeedPhraseModule } from "../../components/SeedPhraseModule";

const GenerateSeedPhrase = () => {
  const pageId = "generate-seed-phrase";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const seedPhraseStore = useAppSelector(getSeedPhraseCache);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [seedPhrase160, setSeedPhrase160] = useState<string[]>([]);
  const [seedPhrase256, setSeedPhrase256] = useState<string[]>([]);
  const [hideSeedPhrase, setHideSeedPhrase] = useState(true);
  const [alertConfirmIsOpen, setAlertConfirmIsOpen] = useState(false);
  const [termsModalIsOpen, setTermsModalIsOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  const initializeSeedPhrase = () => {
    setHideSeedPhrase(true);
    const isFifteenWordsSelected =
      seedPhraseStore.selected === FIFTEEN_WORDS_BIT_LENGTH;
    let seed160;
    let seed256;
    if (
      seedPhraseStore.seedPhrase160.length > 0 &&
      seedPhraseStore.seedPhrase256.length > 0
    ) {
      seed160 = seedPhraseStore.seedPhrase160.split(" ");
      setSeedPhrase160(seed160);
      seed256 = seedPhraseStore.seedPhrase256.split(" ");
      setSeedPhrase256(seed256);
    } else {
      seed160 = generateMnemonic(FIFTEEN_WORDS_BIT_LENGTH).split(" ");
      setSeedPhrase160(seed160);
      seed256 = generateMnemonic(TWENTYFOUR_WORDS_BIT_LENGTH).split(" ");
      setSeedPhrase256(seed256);
    }
    setSeedPhrase(isFifteenWordsSelected ? seed160 : seed256);
  };

  useEffect(() => {
    if (history?.location.pathname === RoutePath.GENERATE_SEED_PHRASE) {
      initializeSeedPhrase();
    }
  }, [history?.location.pathname]);

  const handleClearState = () => {
    setSeedPhrase160([]);
    setSeedPhrase256([]);
    initializeSeedPhrase();
    setHideSeedPhrase(false);
    setAlertConfirmIsOpen(false);
    setChecked(false);
  };

  const toggleSeedPhrase = (length: number) => {
    if (length === FIFTEEN_WORDS_BIT_LENGTH) {
      setSeedPhrase(seedPhrase160);
    } else {
      setSeedPhrase(seedPhrase256);
    }
    setHideSeedPhrase(true);
  };

  const HandleTerms = () => {
    return <u>{i18n.t("generateseedphrase.termsandconditions.link")}</u>;
  };

  const handleContinue = () => {
    setAlertConfirmIsOpen(false);
    const data: DataProps = {
      store: { stateCache },
      state: {
        seedPhrase160: seedPhrase160.join(" "),
        seedPhrase256: seedPhrase256.join(" "),
        selected:
          seedPhrase.length === MNEMONIC_FIFTEEN_WORDS
            ? FIFTEEN_WORDS_BIT_LENGTH
            : TWENTYFOUR_WORDS_BIT_LENGTH,
      },
    };
    const { nextPath, updateRedux } = getNextRoute(
      RoutePath.GENERATE_SEED_PHRASE,
      data
    );
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    handleClearState();
    history.push({
      pathname: nextPath.pathname,
    });
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
      <MnemonicLengthSegment
        seedPhrase={seedPhrase}
        toggleSeedPhrase={toggleSeedPhrase}
      />
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
        <p
          data-testid="terms-and-conditions-modal-handler"
          onClick={() => setTermsModalIsOpen(true)}
        >
          <Trans
            i18nKey={i18n.t("generateseedphrase.termsandconditions.text")}
            components={[<HandleTerms key="" />]}
          />
        </p>
      </div>
      <TermsAndConditionsModal
        isOpen={termsModalIsOpen}
        setIsOpen={setTermsModalIsOpen}
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
        dataTestId="alert-confirm"
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
