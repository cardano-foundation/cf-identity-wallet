import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonCard,
  IonChip,
  IonCol,
  IonGrid,
  IonPage,
  IonRow,
} from "@ionic/react";
import { i18n } from "../../../i18n";
import { RoutePath } from "../../../routes";
import { PageLayout } from "../../components/layout/PageLayout";
import { useAppSelector } from "../../../store/hooks";
import Alert from "../../components/Alert/Alert";
import { getSeedPhraseCache } from "../../../store/reducers/seedPhraseCache";
import "./VerifySeedPhrase.scss";

const VerifySeedPhrase = () => {
  const history = useHistory();
  const originalSeedPhrase =
    useAppSelector(getSeedPhraseCache).seedPhrase.split(" ");
  const [seedPhraseRemaining, setSeedPhraseRemaining] = useState<string[]>([]);
  const [seedPhraseSelected, setSeedPhraseSelected] = useState<string[]>([]);
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  useEffect(() => {
    if (originalSeedPhrase && originalSeedPhrase.length) {
      setSeedPhraseRemaining(
        [...originalSeedPhrase].sort(() => Math.random() - 0.5)
      );
    }
  }, []);

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

  const removeseedPhraseSelected = (index: number) => {
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

  const handleContinue = async () => {
    if (
      originalSeedPhrase.length === seedPhraseSelected.length &&
      originalSeedPhrase.every((v, i) => v === seedPhraseSelected[i])
    ) {
      // TODO: Store Seed Phrase, clear cache and navigate to the next page
      history.push(RoutePath.TABS_MENU);
    } else {
      setAlertIsOpen(true);
    }
  };

  return (
    <IonPage className="page-layout verify-seedphrase">
      <PageLayout
        header={true}
        backButton={true}
        backButtonPath={RoutePath.GENERATE_SEED_PHRASE}
        progressBar={true}
        progressBarValue={1}
        progressBarBuffer={1}
        footer={true}
        primaryButtonText={`${i18n.t("verifyseedphrase.continue.button")}`}
        primaryButtonAction={() => handleContinue()}
        primaryButtonDisabled={
          !(originalSeedPhrase.length == seedPhraseSelected.length)
        }
      >
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <h2>{i18n.t("verifyseedphrase.title")}</h2>
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
                        removeseedPhraseSelected(index);
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

        <Alert
          isOpen={alertIsOpen}
          setIsOpen={setAlertIsOpen}
          headerText={i18n.t("verifyseedphrase.alert.text")}
          cancelButtonText={`${i18n.t("verifyseedphrase.alert.button.cancel")}`}
        />
      </PageLayout>
    </IonPage>
  );
};

export { VerifySeedPhrase };
