import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { RoutePath } from "../../../routes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { Alert as AlertExit, Alert as AlertFail } from "../../components/Alert";
import { getSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import "./VerifySeedPhrase.scss";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { getStateCache } from "../../../store/reducers/stateCache";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../globals/constants";
import { getBackRoute } from "../../../routes/backRoute";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { Addresses } from "../../../core/cardano";
import { PageHeader } from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter/PageFooter";
import { SeedPhraseModule } from "../../components/SeedPhraseModule";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";

const VerifySeedPhrase = () => {
  const pageId = "verify-seed-phrase";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const seedPhraseStore = useAppSelector(getSeedPhraseCache);
  const originalSeedPhrase =
    seedPhraseStore.selected === FIFTEEN_WORDS_BIT_LENGTH
      ? seedPhraseStore.seedPhrase160.split(" ")
      : seedPhraseStore.seedPhrase256.split(" ");
  const [seedPhraseRemaining, setSeedPhraseRemaining] = useState<string[]>([]);
  const [seedPhraseSelected, setSeedPhraseSelected] = useState<string[]>([]);
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  useEffect(() => {
    if (history?.location.pathname === RoutePath.VERIFY_SEED_PHRASE) {
      setSeedPhraseRemaining(
        originalSeedPhrase.sort(() => Math.random() - 0.5)
      );
    }
  }, [history?.location.pathname]);

  const handleClearState = () => {
    setSeedPhraseRemaining([]);
    setSeedPhraseSelected([]);
    setAlertIsOpen(false);
  };

  const addSeedPhraseSelected = (word: string) => {
    setSeedPhraseSelected((seedPhraseSelected) => [
      ...seedPhraseSelected,
      word,
    ]);

    const index = seedPhraseRemaining.indexOf(word);
    if (index > -1) {
      seedPhraseRemaining.splice(index, 1);
    }
    setSeedPhraseRemaining(seedPhraseRemaining);
  };

  const removeSeedPhraseSelected = (index: number) => {
    const removingQuantity = seedPhraseSelected.length - index;
    const newMatch = seedPhraseSelected;
    const words = [];
    for (let i = 0; i < removingQuantity; i++) {
      words.push(newMatch[newMatch.length - 1]);
      newMatch.pop();
    }
    setSeedPhraseRemaining(seedPhraseRemaining.concat(words));
    setSeedPhraseSelected(newMatch);
  };

  const storeIdentitySeedPhrase = async () => {
    try {
      const seedPhraseString = originalSeedPhrase.join(" ");
      const entropy = Addresses.convertToEntropy(seedPhraseString);
      await SecureStorage.set(
        KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY,
        Addresses.bech32ToHexBip32Private(
          Addresses.entropyToBip32NoPasscode(entropy)
        )
      );
      await SecureStorage.set(KeyStoreKeys.IDENTITY_ENTROPY, entropy);

      handleNavigate();
    } catch (e) {
      // @TODO - sdisalvo: handle error
    }
  };

  const handleContinue = async () => {
    if (
      originalSeedPhrase.length === seedPhraseSelected.length &&
      originalSeedPhrase.every((v, i) => v === seedPhraseSelected[i])
    ) {
      storeIdentitySeedPhrase();
    } else {
      setAlertIsOpen(true);
    }
  };

  const handleNavigate = () => {
    const data: DataProps = {
      store: { stateCache },
      state: {
        currentOperation: stateCache.currentOperation,
      },
    };
    const { nextPath, updateRedux } = getNextRoute(
      RoutePath.VERIFY_SEED_PHRASE,
      data
    );
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    handleClearState();
    history.push(nextPath.pathname);
  };

  const handleExit = () => {
    handleClearState();
    const { backPath, updateRedux } = getBackRoute(
      RoutePath.VERIFY_SEED_PHRASE,
      {
        store: { stateCache },
      }
    );
    updateReduxState(
      backPath.pathname,
      { store: { stateCache } },
      dispatch,
      updateRedux
    );
    history.push({
      pathname: backPath.pathname,
    });
  };

  return (
    <ResponsivePageLayout
      pageId={pageId}
      header={
        <PageHeader
          backButton={true}
          onBack={() => {
            handleClearState();
            handleExit();
          }}
          currentPath={RoutePath.VERIFY_SEED_PHRASE}
          progressBar={true}
          progressBarValue={1}
          progressBarBuffer={1}
        />
      }
    >
      <h2 data-testid={`${pageId}-title`}>
        {i18n.t("verifyseedphrase.onboarding.title")}
      </h2>
      <p data-testid={`${pageId}-paragraph-top`}>
        {i18n.t("verifyseedphrase.paragraph.top")}
      </p>
      <SeedPhraseModule
        testId="matching-seed-phrase-container"
        seedPhrase={seedPhraseSelected}
        emptyWord={!!seedPhraseRemaining.length}
        removeSeedPhraseSelected={removeSeedPhraseSelected}
      />
      <SeedPhraseModule
        testId="original-seed-phrase-container"
        seedPhrase={seedPhraseRemaining}
        addSeedPhraseSelected={addSeedPhraseSelected}
      />
      <PageFooter
        pageId={pageId}
        primaryButtonText={`${i18n.t(
          "verifyseedphrase.onboarding.button.continue"
        )}`}
        primaryButtonAction={() => handleContinue()}
        primaryButtonDisabled={
          !(originalSeedPhrase.length == seedPhraseSelected.length)
        }
      />
      <AlertFail
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-fail"
        headerText={i18n.t("verifyseedphrase.alert.fail.text")}
        confirmButtonText={`${i18n.t(
          "verifyseedphrase.alert.fail.button.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "verifyseedphrase.alert.fail.button.cancel"
        )}`}
        actionConfirm={handleExit}
      />
    </ResponsivePageLayout>
  );
};

export { VerifySeedPhrase };
