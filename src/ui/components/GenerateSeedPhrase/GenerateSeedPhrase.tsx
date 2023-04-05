import { useEffect, useState } from "react";
import {
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
import "./style.scss";
import { eyeOffOutline } from "ionicons/icons";
import { generateMnemonic } from "bip39";
import PageLayout from "../common/PageLayout/PageLayout";

const GenerateSeedPhrase = () => {
  const pageName = "Generate Seed Phrase";
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);

  const generateSeedPhrase = (size: number) => {
    const seed: string = generateMnemonic(size);
    setSeedPhrase(seed.split(" "));
  };

  useEffect(() => {
    generateSeedPhrase(160);
  }, []);

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
            <h1>{pageName}</h1>
            <p>
              Think of your secret recovery phrase as a safety net for your
              identity. If you ever lose your phone or switch to a new wallet,
              this phrase will help you recover your identity.
            </p>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonGrid>
        <IonRow>
          <IonCol size="12">
            <IonSegment
              data-testid="segment"
              value={`${seedPhrase.length === 15 ? 160 : 256}`}
              onIonChange={(event) =>
                generateSeedPhrase(event.detail.value as unknown as number)
              }
            >
              <IonSegmentButton value="160">
                <IonLabel>15 words</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="256">
                <IonLabel>24 words</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="12">
            <IonCard>
              <div
                data-testid="overlay"
                className={`overlay ${showSeedPhrase ? "hidden" : "visible"}`}
              >
                <IonCardHeader>
                  <IonIcon
                    size="large"
                    icon={eyeOffOutline}
                  />
                </IonCardHeader>
                <IonCardContent>
                  <p>
                    Press the ‘view’ button when you’re ready to see your seed
                    phrase. Remember to make sure nobody is looking!
                  </p>
                </IonCardContent>
                <IonButton
                  shape="round"
                  fill="outline"
                  data-testid="overlay-button"
                  onClick={() => {
                    setShowSeedPhrase(true);
                  }}
                >
                  View seed phrase
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
            <p>
              It's important to keep these words safe and sound! Store them in a
              secure location, like a password manager, and remember to never
              share them with anyone.
            </p>
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonGrid className="footer">
        <IonRow>
          <IonCol>
            <IonButton
              shape="round"
              fill="outline"
              expand="block"
              disabled={true}
            >
              Back up your seed phrase
            </IonButton>
            <IonButton
              shape="round"
              expand="block"
              disabled={true}
            >
              Continue
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </PageLayout>
  );
};

export default GenerateSeedPhrase;
