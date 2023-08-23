import { useEffect, useState } from "react";
import {
  IonCard,
  IonChip,
  IonCol,
  IonGrid,
  IonPage,
  IonRow,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { i18n } from "../../../i18n";
import { RoutePath } from "../../../routes";
import { PageLayout } from "../../components/layout/PageLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { Alert as AlertExit, Alert as AlertFail } from "../../components/Alert";
import { getSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import "./VerifySeedPhrase.scss";
import { KeyStoreKeys, SecureStorage } from "../../../core/storage";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import {
  getOnboardingRoute,
  getStateCache,
  setOnboardingRoute,
} from "../../../store/reducers/stateCache";
import { FIFTEEN_WORDS_BIT_LENGTH } from "../../../constants/appConstants";
import { generateSeedPhraseState } from "../../constants/dictionary";
import { getBackRoute } from "../../../routes/backRoute";
import { TabsRoutePath } from "../../../routes/paths";
import { ChooseAccountName } from "../../components/ChooseAccountName";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { GenerateSeedPhraseProps } from "../GenerateSeedPhrase/GenerateSeedPhrase.types";
import { Addresses } from "../../../core/cardano";

const VerifySeedPhrase = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const seedPhraseType = !stateCache.authentication.seedPhraseIsSet
    ? generateSeedPhraseState.onboarding
    : (history?.location?.state as GenerateSeedPhraseProps)?.type || "";
  const seedPhraseStore = useAppSelector(getSeedPhraseCache);
  const originalSeedPhrase =
    seedPhraseStore.selected === FIFTEEN_WORDS_BIT_LENGTH
      ? seedPhraseStore.seedPhrase160.split(" ")
      : seedPhraseStore.seedPhrase256.split(" ");
  const [seedPhraseRemaining, setSeedPhraseRemaining] = useState<string[]>([]);
  const [seedPhraseSelected, setSeedPhraseSelected] = useState<string[]>([]);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [alertExitIsOpen, setAlertExitIsOpen] = useState(false);
  const [chooseAccountNameIsOpen, setChooseAccountNameIsOpen] = useState(false);
  const routeCache = useAppSelector(getOnboardingRoute);

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
    dispatch(setOnboardingRoute(""));
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
    const seedPhraseString = originalSeedPhrase.join(" ");
    const convertToEntropy = Addresses.convertToEntropy(seedPhraseString);
    await SecureStorage.set(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY,
      Addresses.convertEntropyToHexXPrvNoPasscode(convertToEntropy)
    );
    await SecureStorage.set(KeyStoreKeys.IDENTITY_ENTROPY, convertToEntropy);
    const data: DataProps = {
      store: { stateCache },
      state: { onboardingRoute: routeCache },
    };
    const { nextPath, updateRedux } = getNextRoute(
      RoutePath.VERIFY_SEED_PHRASE,
      data
    );
    updateReduxState(nextPath.pathname, data, dispatch, updateRedux);
    handleClearState();
    history.push(nextPath.pathname);
  };

  const handleContinue = async () => {
    if (
      originalSeedPhrase.length === seedPhraseSelected.length &&
      originalSeedPhrase.every((v, i) => v === seedPhraseSelected[i])
    ) {
      if (seedPhraseType === generateSeedPhraseState.onboarding) {
        storeIdentitySeedPhrase();
      } else {
        setChooseAccountNameIsOpen(true);
      }
    } else {
      setAlertIsOpen(true);
    }
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
      state: {
        type: seedPhraseType,
      },
    });
  };

  return (
    <IonPage className="page-layout verify-seedphrase">
      <PageLayout
        id="verify-seedphrase"
        header={true}
        title={
          seedPhraseType !== generateSeedPhraseState.onboarding
            ? `${i18n.t("verifyseedphrase." + seedPhraseType + ".title")}`
            : undefined
        }
        backButton={true}
        onBack={
          seedPhraseType === generateSeedPhraseState.onboarding
            ? handleClearState
            : () => setAlertExitIsOpen(true)
        }
        currentPath={RoutePath.VERIFY_SEED_PHRASE}
        progressBar={seedPhraseType === generateSeedPhraseState.onboarding}
        progressBarValue={1}
        progressBarBuffer={1}
        footer={true}
        primaryButtonText={`${i18n.t(
          "verifyseedphrase." + seedPhraseType + ".continue.button"
        )}`}
        primaryButtonAction={() => handleContinue()}
        primaryButtonDisabled={
          !(originalSeedPhrase.length == seedPhraseSelected.length)
        }
      >
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              {seedPhraseType === generateSeedPhraseState.onboarding && (
                <h2>
                  {i18n.t("verifyseedphrase." + seedPhraseType + ".title")}
                </h2>
              )}
              <p className="page-paragraph">
                {i18n.t("verifyseedphrase.paragraph.top")}
              </p>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonCard className="container-top">
                <div
                  data-testid="matching-seed-phrase-container"
                  className="seed-phrase-container"
                >
                  {seedPhraseSelected.map((word, index) => (
                    <IonChip
                      key={index}
                      onClick={() => {
                        removeSeedPhraseSelected(index);
                      }}
                    >
                      <span className="index">{index + 1}.</span>
                      <span>{word}</span>
                    </IonChip>
                  ))}
                  {seedPhraseRemaining.length ? (
                    <IonChip className="empty-word">
                      <span className="index">
                        {seedPhraseSelected.length + 1}.
                      </span>
                    </IonChip>
                  ) : null}
                </div>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        {seedPhraseRemaining.length ? (
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonCard className="container-bottom">
                  <div
                    data-testid="original-seed-phrase-container"
                    className="seed-phrase-container"
                  >
                    {seedPhraseRemaining.map((word, index) => (
                      <IonChip
                        key={index}
                        data-testid={`remaining-word-${word}`}
                        onClick={() => {
                          addSeedPhraseSelected(word);
                        }}
                      >
                        <span>{word}</span>
                      </IonChip>
                    ))}
                  </div>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        ) : null}

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
        <AlertExit
          isOpen={alertExitIsOpen}
          setIsOpen={setAlertExitIsOpen}
          dataTestId="alert-exit"
          headerText={i18n.t("verifyseedphrase.alert.exit.text")}
          confirmButtonText={`${i18n.t(
            "verifyseedphrase.alert.exit.button.confirm"
          )}`}
          cancelButtonText={`${i18n.t(
            "verifyseedphrase.alert.exit.button.cancel"
          )}`}
          actionConfirm={handleExit}
        />
        <ChooseAccountName
          chooseAccountNameIsOpen={chooseAccountNameIsOpen}
          setChooseAccountNameIsOpen={setChooseAccountNameIsOpen}
          usesIdentitySeedPhrase={false}
          seedPhrase={originalSeedPhrase.join(" ")}
          onDone={() => {
            handleClearState();
            history.push({
              pathname: TabsRoutePath.CRYPTO,
              state: {
                type: generateSeedPhraseState.success,
              },
            });
          }}
        />
      </PageLayout>
    </IonPage>
  );
};

export { VerifySeedPhrase };
