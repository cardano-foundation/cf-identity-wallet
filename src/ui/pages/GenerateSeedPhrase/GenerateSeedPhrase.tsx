import { useEffect, useState } from "react";
import { i18n } from "../../../i18n";
import {
  IonAlert,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonChip,
  IonCol,
  IonGrid,
  IonIcon,
  IonLabel,
  IonRow,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import "./GenerateSeedPhrase.scss";
import { eyeOffOutline } from "ionicons/icons";
import { generateMnemonic } from "bip39";
import {
  MNEMONIC_FIFTEEN_WORDS,
  MNEMONIC_TWENTYFOUR_WORDS,
  FIFTEEN_WORDS_BIT_LENGTH,
  TWENTYFOUR_WORDS_BIT_LENGTH,
} from "../../../constants/appConstants";
import { PageLayout } from "../../components/layout/PageLayout";

const GenerateSeedPhrase = () => {
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [seedPhrase160, setSeedPhrase160] = useState<string[]>([]);
  const [seedPhrase256, setSeedPhrase256] = useState<string[]>([]);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <PageLayout
      backButton={true}
      backButtonPath={"/"}
      contentClasses=""
      progressBar={true}
      progressBarValue={0.2}
      progressBarBuffer={1}
    >
      <IonGrid>
        <IonRow>
          <IonCol size="12">
            <h1>{i18n.t("generateseedphrase.title")}</h1>
            <p>{i18n.t("generateseedphrase.paragraph.top")}</p>
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
                  showSeedPhrase ? "seed-phrase-visible" : "seed-phrase-blurred"
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
            <p>{i18n.t("generateseedphrase.paragraph.bottom")}</p>
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
              disabled={!showSeedPhrase}
              onClick={() => setIsOpen(true)}
            >
              {i18n.t("generateseedphrase.continue.button")}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
      <div
        data-testid="alert-wrapper"
        className={isOpen ? "alert-visible" : "alert-invisible"}
      >
        <IonAlert
          isOpen={isOpen}
          header={String(i18n.t("generateseedphrase.alert.text"))}
          buttons={[
            {
              text: String(i18n.t("generateseedphrase.alert.button.confirm")),
              role: "confirm",
              handler: () => {
                setIsOpen(false);
              },
            },
            {
              text: String(i18n.t("generateseedphrase.alert.button.cancel")),
              role: "cancel",
              handler: () => {
                setIsOpen(false);
              },
            },
          ]}
          onDidDismiss={() => setIsOpen(false)}
        />
      </div>
    </PageLayout>
  );
};

export { GenerateSeedPhrase };
