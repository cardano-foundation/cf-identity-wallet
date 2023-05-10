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
import Alert from "../../components/Alert/Alert";
import { getState, setCurrentRoute } from "../../../store/reducers/stateCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { TermsAndConditions } from "../../components/TermsAndConditions";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateReduxState } from "../../../store/utils";
import { ROUTES } from "../../../routes";

const GenerateSeedPhrase = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const storeState = useAppSelector(getState);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [seedPhrase160, setSeedPhrase160] = useState<string[]>([]);
  const [seedPhrase256, setSeedPhrase256] = useState<string[]>([]);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [alertIsOpen, setAlertIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const seed160 = generateMnemonic(FIFTEEN_WORDS_BIT_LENGTH).split(" ");
    setSeedPhrase160(seed160);
    setSeedPhrase(seed160);
    setSeedPhrase256(generateMnemonic(TWENTYFOUR_WORDS_BIT_LENGTH).split(" "));
  }, []);

  const toggleSeedPhrase = (length: number) => {
    if (length === FIFTEEN_WORDS_BIT_LENGTH) {
      setSeedPhrase(seedPhrase160);
    } else {
      setSeedPhrase(seedPhrase256);
    }
  };

  const HandleTerms = () => {
    return (
      <a
        onClick={() => {
          setChecked(true);
          setModalIsOpen(true);
        }}
      >
        <u>{i18n.t("generateseedphrase.termsandconditions.link")}</u>
      </a>
    );
  };

  const handleContinue = () => {
    setAlertIsOpen(false);
    const { nextPath, updateRedux } = getNextRoute(
      ROUTES.GENERATE_SEED_PHRASE_ROUTE,
      storeState,
      { seedPhrase: seedPhrase.join(" ") }
    );
    if (nextPath.canNavigate) {
      if (updateRedux?.length) updateReduxState(dispatch, updateRedux);
      dispatch(setCurrentRoute({ path: nextPath.pathname }));
      history.push(nextPath.pathname);
    }
  };

  return (
    <IonPage className="page-layout generate-seedphrase">
      <PageLayout
        backButton={true}
        backButtonPath={ROUTES.ONBOARDING_ROUTE}
        progressBar={true}
        progressBarValue={0.66}
        progressBarBuffer={1}
      >
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <h1>{i18n.t("generateseedphrase.title")}</h1>
              <p className="paragraph">
                {i18n.t("generateseedphrase.paragraph.top")}
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
                  setShowSeedPhrase(false);
                  toggleSeedPhrase(Number(event.detail.value));
                }}
              >
                <IonSegmentButton value={String(FIFTEEN_WORDS_BIT_LENGTH)}>
                  <IonLabel>
                    {i18n.t("generateseedphrase.segment", {
                      length: MNEMONIC_FIFTEEN_WORDS,
                    })}
                  </IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value={String(TWENTYFOUR_WORDS_BIT_LENGTH)}>
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
                  className={`overlay ${showSeedPhrase ? "hidden" : "visible"}`}
                >
                  <IonCardHeader>
                    <IonIcon
                      size="large"
                      icon={eyeOffOutline}
                    />
                  </IonCardHeader>
                  <IonCardContent>
                    <p>{i18n.t("generateseedphrase.privacy.overlay.text")}</p>
                  </IonCardContent>
                  <IonButton
                    shape="round"
                    fill="outline"
                    data-testid="reveal-seed-phrase-button"
                    onClick={() => {
                      setShowSeedPhrase(true);
                    }}
                  >
                    {i18n.t("generateseedphrase.privacy.overlay.button")}
                  </IonButton>
                </div>
                <div
                  data-testid="seed-phrase-container"
                  className={`seed-phrase-container ${
                    showSeedPhrase
                      ? "seed-phrase-visible"
                      : "seed-phrase-blurred"
                  }
                }`}
                >
                  {seedPhrase.map((word, index) => (
                    <IonChip key={index}>
                      <span className="index">{index + 1}.</span>
                      <span>{word}</span>
                    </IonChip>
                  ))}
                </div>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <p className="paragraph">
                {i18n.t("generateseedphrase.paragraph.bottom")}
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
                  onIonChange={(e) => setChecked(e.detail.checked)}
                />
                <IonLabel
                  slot="end"
                  className="ion-text-wrap"
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
                isOpen={modalIsOpen}
                setIsOpen={setModalIsOpen}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid className="footer">
          <IonRow>
            <IonCol>
              <IonButton
                shape="round"
                expand="block"
                className="ion-primary-button"
                data-testid="generate-seed-phrase-continue-button"
                disabled={!(showSeedPhrase && checked)}
                onClick={() => setAlertIsOpen(true)}
              >
                {i18n.t("generateseedphrase.continue.button")}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          headerText={i18n.t("generateseedphrase.alert.text")}
          confirmButtonText={i18n.t("generateseedphrase.alert.button.confirm")}
          cancelButtonText={i18n.t("generateseedphrase.alert.button.cancel")}
          actionConfirm={handleContinue}
        />
      </PageLayout>
    </IonPage>
  );
};

export { GenerateSeedPhrase };
