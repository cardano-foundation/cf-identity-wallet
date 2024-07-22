import { useCallback, useEffect, useMemo, useState } from "react";
import { closeOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { IonButton, IonIcon } from "@ionic/react";
import { i18n } from "../../../i18n";
import { RoutePath } from "../../../routes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { Alert as AlertFail } from "../../components/Alert";
import { getSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { getStateCache } from "../../../store/reducers/stateCache";
import { getBackRoute } from "../../../routes/backRoute";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { PageHeader } from "../../components/PageHeader";
import { PageFooter } from "../../components/PageFooter";
import { SeedPhraseModule } from "../../components/SeedPhraseModule";
import { ResponsivePageLayout } from "../../components/layout/ResponsivePageLayout";
import { useAppIonRouter } from "../../hooks";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { SwitchOnboardingMode } from "../../components/SwitchOnboardingMode";
import { OnboardingMode } from "../../components/SwitchOnboardingMode/SwitchOnboardingMode.types";
import "./VerifySeedPhrase.scss";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";

const VerifySeedPhrase = () => {
  const pageId = "verify-seed-phrase";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const seedPhraseStore = useAppSelector(getSeedPhraseCache);
  const [seedPhraseRemaining, setSeedPhraseRemaining] = useState<string[]>([]);
  const [seedPhraseSelected, setSeedPhraseSelected] = useState<string[]>([]);
  const [clearAlertOpen, setClearAlertOpen] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const ionRouter = useAppIonRouter();

  const originalSeedPhrase = useMemo(
    () => seedPhraseStore.seedPhrase.split(" "),
    [seedPhraseStore.seedPhrase]
  );

  const shuffleSeedPhrase = useCallback(() => {
    setSeedPhraseRemaining(
      [...originalSeedPhrase].sort(() => Math.random() - 0.5)
    );
  }, [originalSeedPhrase]);

  useEffect(() => {
    if (history?.location.pathname === RoutePath.VERIFY_SEED_PHRASE) {
      shuffleSeedPhrase();
    }
  }, [history?.location.pathname, shuffleSeedPhrase]);

  const handleClearSelected = () => {
    setSeedPhraseSelected([]);
    shuffleSeedPhrase();
    setClearAlertOpen(false);
  };

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
    await SecureStorage.set(KeyStoreKeys.SIGNIFY_BRAN, seedPhraseStore.bran);
    handleNavigate();
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

    ionRouter.push(nextPath.pathname, "root", "replace");
  };

  const handleBack = useCallback(() => {
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
    ionRouter.push(backPath.pathname, "back", "pop");
  }, [dispatch, ionRouter, stateCache]);

  const closeFailAlert = () => {
    setAlertIsOpen(false);
  };

  return (
    <ScrollablePageLayout
      pageId={pageId}
      header={
        <PageHeader
          closeButton
          closeButtonLabel={`${i18n.t(
            "verifyseedphrase.onboarding.button.back"
          )}`}
          closeButtonAction={() => {
            handleClearState();
            handleBack();
          }}
          currentPath={RoutePath.VERIFY_SEED_PHRASE}
          progressBar={true}
          progressBarValue={1}
          progressBarBuffer={1}
        />
      }
    >
      <div className="content-container">
        <div>
          <h2 data-testid={`${pageId}-title`}>
            {i18n.t("verifyseedphrase.onboarding.title")}
          </h2>
          <p
            className="paragraph-top"
            data-testid={`${pageId}-paragraph-top`}
          >
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
            hideSeedNumber
          />
          {seedPhraseSelected.length > 0 && (
            <IonButton
              onClick={() => setClearAlertOpen(true)}
              fill="outline"
              data-testid="verify-clear-button"
              className="clear-button secondary-button"
            >
              <IonIcon
                slot="start"
                icon={closeOutline}
              />
              {i18n.t("verifyseedphrase.onboarding.button.clear")}
            </IonButton>
          )}
          <SwitchOnboardingMode mode={OnboardingMode.Recovery} />
        </div>
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
      </div>
      <AlertFail
        isOpen={alertIsOpen}
        setIsOpen={setAlertIsOpen}
        dataTestId="alert-fail"
        headerText={i18n.t("verifyseedphrase.alert.fail.text")}
        confirmButtonText={`${i18n.t(
          "verifyseedphrase.alert.fail.button.confirm"
        )}`}
        actionConfirm={closeFailAlert}
      />
      <AlertFail
        isOpen={clearAlertOpen}
        setIsOpen={setClearAlertOpen}
        dataTestId="alert-fail"
        headerText={i18n.t("verifyseedphrase.alert.clear.text")}
        confirmButtonText={`${i18n.t(
          "verifyseedphrase.alert.clear.button.confirm"
        )}`}
        cancelButtonText={`${i18n.t(
          "verifyseedphrase.alert.clear.button.cancel"
        )}`}
        actionConfirm={handleClearSelected}
        actionCancel={() => setClearAlertOpen(false)}
        actionDismiss={() => setClearAlertOpen(false)}
      />
    </ScrollablePageLayout>
  );
};

export { VerifySeedPhrase };
