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
  IonRow,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./GenerateSeedPhrase.scss";
import { eyeOffOutline } from "ionicons/icons";
import { generateMnemonic } from "bip39";
import { Trans } from "react-i18next";
import { i18n } from "../../../i18n";
import {
  MNEMONIC_FIFTEEN_WORDS,
  FIFTEEN_WORDS_BIT_LENGTH,
  TWENTYFOUR_WORDS_BIT_LENGTH,
} from "../../../constants/appConstants";
import { Alert as AlertConfirm } from "../../components/Alert";
import { getStateCache } from "../../../store/reducers/stateCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { TermsAndConditions } from "../../components/TermsAndConditions";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateReduxState } from "../../../store/utils";
import { RoutePath } from "../../../routes";
import { DataProps } from "../../../routes/nextRoute/nextRoute.types";
import { getSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import { ScrollablePageLayout } from "../../components/layout/ScrollablePageLayout";
import { PageHeader } from "../../components/PageHeader";
import PageFooter from "../../components/PageFooter/PageFooter";
import { MnemonicLengthSegment } from "../../components/MnemonicLengthSegment";

const GenerateSeedPhrase = () => {
  const pageId = "generate-seed-phrase";
  const history = useHistory();
  const dispatch = useAppDispatch();
  const stateCache = useAppSelector(getStateCache);
  const seedPhraseStore = useAppSelector(getSeedPhraseCache);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [seedPhrase160, setSeedPhrase160] = useState<string[]>([]);
  const [seedPhrase256, setSeedPhrase256] = useState<string[]>([]);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [alertConfirmIsOpen, setAlertConfirmIsOpen] = useState(false);
  const [termsModalIsOpen, setTermsModalIsOpen] = useState(false);
  const [checked, setChecked] = useState(false);

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

  return (
    <ScrollablePageLayout
      pageId={pageId}
      header={
        <PageHeader
          backButton={true}
          beforeBack={handleClearState}
          currentPath={RoutePath.GENERATE_SEED_PHRASE}
          progressBar={true}
          progressBarValue={0.66}
          progressBarBuffer={1}
        />
      }
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
            <MnemonicLengthSegment
              seedPhrase={seedPhrase}
              toggleSeedPhrase={toggleSeedPhrase}
            />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="12">
            <IonCard>
              <div
                data-testid="seed-phrase-privacy-overlay"
                className={`overlay ${showSeedPhrase ? "hidden" : "visible"}`}
              >
                <IonCardHeader>
                  <IonIcon icon={eyeOffOutline} />
                </IonCardHeader>
                <IonCardContent data-testid="seed-phrase-privacy-overlay-text">
                  <p>{i18n.t("generateseedphrase.privacy.overlay.text")}</p>
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
                  showSeedPhrase ? "seed-phrase-visible" : "seed-phrase-blurred"
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
                  i18nKey={i18n.t("generateseedphrase.termsandconditions.text")}
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
      <PageFooter
        pageId={pageId}
        primaryButtonText={`${i18n.t(
          "generateseedphrase.onboarding.button.continue"
        )}`}
        primaryButtonAction={() => {
          setAlertConfirmIsOpen(true);
        }}
        primaryButtonDisabled={!(showSeedPhrase && checked)}
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
