import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
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
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import "./style.scss";
import { eyeOffOutline } from "ionicons/icons";
import { generateMnemonic } from "bip39";
import PageLayout from "../common/PageLayout";

const GenerateSeedPhrase = () => {
  const pageName = "Generate Seed Phrase";
  const [checked, setChecked] = useState(false);
  const [view, setView] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const history = useHistory();
  const location = useLocation();

  const generateSeedPhrase = (size: number) => {
    const seed: string = generateMnemonic(size);
    setSeedPhrase(seed.split(" "));
  };

  useEffect(() => {
    generateSeedPhrase(160);
  }, []);

  const handleNavigation = (route: string) => {
    history.push({
      pathname: route,
      state: {
        seedPhrase,
        // walletName: location.state?.walletName,
        // walletPassword: location.state?.walletPassword,
      },
    });
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
              value={`${seedPhrase.length}words`}
              // onIonChange={(event) => {
              //   (event.detail.value as string) === "15words"
              //     ? generateSeedPhrase(15)
              //     : generateSeedPhrase(24);
              // }}
            >
              <IonSegmentButton value="15words">
                <IonLabel>15 words</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="24words">
                <IonLabel>24 words</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol
            size="12"
            className={`flex flex-col justify-center ${
              view && seedPhrase.length === 15 && "min-h-[42vh]"
            }`}
          >
            <IonCard>
              <div className={`overlay ${view ? "hidden" : "visible"}`}>
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
                  onClick={() => {
                    setView(true);
                  }}
                >
                  View seed phrase
                </IonButton>
              </div>
              <div className="seed-phrase-container">
                {seedPhrase.map((word, index) => (
                  <IonChip key={index}>
                    <span>
                      <span>{word}</span>
                    </span>
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
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonButton
              shape="round"
              fill="outline"
              expand="block"
              className=""
              disabled={!checked}
              onClick={() => {
                return;
              }}
            >
              Back up your seed phrase
            </IonButton>
            <IonButton
              shape="round"
              expand="block"
              className=""
              disabled={true}
              onClick={() => {
                return;
              }}
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
