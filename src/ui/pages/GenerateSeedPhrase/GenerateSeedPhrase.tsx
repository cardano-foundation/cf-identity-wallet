import { useEffect, useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCheckbox,
  IonChip,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./GenerateSeedPhrase.scss";
import { eyeOffOutline } from "ionicons/icons";
import { generateMnemonic } from "bip39";
import { Trans } from "react-i18next";
import { i18n } from "../../../i18n";
import {
  MNEMONIC_FIFTEEN_WORDS,
  MNEMONIC_TWENTYFOUR_WORDS,
  FIFTEEN_WORDS_BIT_LENGTH,
  TWENTYFOUR_WORDS_BIT_LENGTH,
} from "../../../constants/appConstants";
import { PageLayout } from "../../components/layout/PageLayout";
import {
  Alert as AlertConfirm,
  Alert as AlertExit,
} from "../../components/Alert";
import {
  getStateCache,
  setCurrentOperation,
} from "../../../store/reducers/stateCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { TermsAndConditions } from "../../components/TermsAndConditions";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateReduxState } from "../../../store/utils";
import { RoutePath } from "../../../routes";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { getSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import { getBackRoute } from "../../../routes/backRoute";

const GenerateSeedPhrase = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);

  const seedPhraseStore = useAppSelector(getSeedPhraseCache);

  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [seedPhrase160, setSeedPhrase160] = useState<string[]>([]);
  const [seedPhrase256, setSeedPhrase256] = useState<string[]>([]);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [alertConfirmIsOpen, setAlertConfirmIsOpen] = useState(false);
  const [alertExitIsOpen, setAlertExitIsOpen] = useState(false);
  const [termsModalIsOpen, setTermsModalIsOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [reloadSeedPhrase, setReloadSeedPhrase] = useState(false);

  useEffect(() => {
    setSeedPhrase(seedPhrase);
  }, [reloadSeedPhrase]);

  const initializeSeedPhrase = () => {
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
    setShowSeedPhrase(false);
    setAlertConfirmIsOpen(false);
    setAlertExitIsOpen(false);
    setChecked(false);
  };

  const toggleSeedPhrase = (length: number) => {
    if (length === FIFTEEN_WORDS_BIT_LENGTH) {
      setSeedPhrase(seedPhrase160);
    } else {
      setSeedPhrase(seedPhrase256);
    }
  };

  const HandleTerms = () => {
    return (
      <a onClick={() => setTermsModalIsOpen(true)}>
        <u>{i18n.t("generateseedphrase.termsandconditions.link")}</u>
      </a>
    );
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

  const handleBack = () => {
    handleClearState();
    dispatch(setCurrentOperation(""));

    const { backPath, updateRedux } = getBackRoute(
      RoutePath.GENERATE_SEED_PHRASE,
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
    history.push(backPath.pathname);
  };

  return (
    <>
      <IonPage className="page-layout generate-seedphrase">
        <PageLayout
          header={true}
          backButton={true}
          beforeBack={handleClearState}
          closeButton={false}
          closeButtonAction={() => setAlertExitIsOpen(true)}
          currentPath={RoutePath.GENERATE_SEED_PHRASE}
          progressBar={true}
          progressBarValue={0.66}
          progressBarBuffer={1}
          footer={true}
          primaryButtonText={`${i18n.t(
            "generateseedphrase.onboarding.button.continue"
          )}`}
          primaryButtonAction={() => {
            setAlertConfirmIsOpen(true);
          }}
          primaryButtonDisabled={!(showSeedPhrase && checked)}
        >
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <h2 data-testid="screen-title">
                  {i18n.t("generateseedphrase.onboarding.title")}
                </h2>
                <p
                  className="page-paragraph"
                  data-testid="page-paragraph-top"
                >
                  {i18n.t("generateseedphrase.onboarding.paragraph.top")}
                </p>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonSegment
                  data-testid="mnemonic-length-segment"
                  value={`${
                    seedPhrase.length === MNEMONIC_TWENTYFOUR_WORDS
                      ? TWENTYFOUR_WORDS_BIT_LENGTH
                      : FIFTEEN_WORDS_BIT_LENGTH
                  }`}
                  onIonChange={(event) => {
                    toggleSeedPhrase(Number(event.detail.value));
                  }}
                >
                  <IonSegmentButton
                    value={`${FIFTEEN_WORDS_BIT_LENGTH}`}
                    data-testid="15-words-segment-button"
                  >
                    <IonLabel>
                      {i18n.t("generateseedphrase.segment", {
                        length: MNEMONIC_FIFTEEN_WORDS,
                      })}
                    </IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton
                    value={`${TWENTYFOUR_WORDS_BIT_LENGTH}`}
                    data-testid="24-words-segment-button"
                  >
                    <IonLabel>
                      {i18n.t("generateseedphrase.segment", {
                        length: MNEMONIC_TWENTYFOUR_WORDS,
                      })}
                    </IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <div
                    data-testid="seed-phrase-privacy-overlay"
                    className={`overlay ${
                      showSeedPhrase ? "hidden" : "visible"
                    }`}
                  >
                    <IonCardHeader>
                      <IonIcon icon={eyeOffOutline} />
                    </IonCardHeader>
                    <IonCardContent data-testid="seed-phrase-privacy-overlay-text">
                      {i18n.t("generateseedphrase.privacy.overlay.text")}
                    </IonCardContent>
                    <IonButton
                      shape="round"
                      fill="outline"
                      data-testid="reveal-seed-phrase-button"
                      onClick={() => setShowSeedPhrase(true)}
                    >
                      {i18n.t("generateseedphrase.privacy.overlay.button")}
                    </IonButton>
                  </div>
                  <div
                    data-testid="seed-phrase-container"
                    className={`seed-phrase-container onboarding ${
                      showSeedPhrase
                        ? "seed-phrase-visible"
                        : "seed-phrase-blurred"
                    }
                }`}
                  >
                    {seedPhrase.map((word, index) => {
                      return (
                        <IonChip key={index}>
                          <span className="index">{index + 1}.</span>
                          <span data-testid={`word-index-${index + 1}`}>
                            {word}
                          </span>
                        </IonChip>
                      );
                    })}
                  </div>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <p
                  className="page-paragraph"
                  data-testid="page-paragraph-bottom"
                >
                  {i18n.t("generateseedphrase.onboarding.paragraph.bottom")}
                </p>
              </IonCol>
            </IonRow>
          </IonGrid>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonItem
                  color="light"
                  lines="none"
                >
                  <IonCheckbox
                    slot="start"
                    checked={checked}
                    data-testid="termsandconditions-checkbox"
                    onIonChange={(event) => setChecked(event.detail.checked)}
                  />
                  <IonLabel
                    slot="end"
                    className="ion-text-wrap termsandconditions-label"
                    color="primary"
                    data-testid="termsandconditions-label"
                  >
                    <Trans
                      i18nKey={i18n.t(
                        "generateseedphrase.termsandconditions.text"
                      )}
                      components={[<HandleTerms key="" />]}
                    />
                  </IonLabel>
                </IonItem>
                <TermsAndConditions
                  isOpen={termsModalIsOpen}
                  setIsOpen={setTermsModalIsOpen}
                />
              </IonCol>
            </IonRow>
          </IonGrid>
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
          <AlertExit
            isOpen={alertExitIsOpen}
            setIsOpen={setAlertExitIsOpen}
            dataTestId="alert-exit"
            headerText={i18n.t("generateseedphrase.alert.exit.text")}
            confirmButtonText={`${i18n.t(
              "generateseedphrase.alert.exit.button.confirm"
            )}`}
            cancelButtonText={`${i18n.t(
              "generateseedphrase.alert.exit.button.cancel"
            )}`}
            actionConfirm={handleBack}
            actionCancel={() => dispatch(setCurrentOperation(""))}
            actionDismiss={() => dispatch(setCurrentOperation(""))}
          />
        </PageLayout>
      </IonPage>
    </>
  );
};

export { GenerateSeedPhrase };
