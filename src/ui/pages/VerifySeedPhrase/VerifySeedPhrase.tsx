import { useEffect, useState } from "react";
import {
  IonButton,
  IonCard,
  IonChip,
  IonCol,
  IonGrid,
  IonPage,
  IonRow,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./VerifySeedPhrase.scss";
import { equals, shuffle } from "../../../utils/utils";
import { i18n } from "../../../i18n";
import { GENERATE_SEED_PHRASE_ROUTE } from "../../../routes";
import { PageLayout } from "../../components/layout/PageLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { clearSeedPhraseCache, getSeedPhraseCache } from "../../../store/reducers/SeedPhraseCache";

const VerifySeedPhrase = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const originalSeedPhrase = useAppSelector(getSeedPhraseCache).seedPhrase.split(" ");
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [seedMatch, setSeedMatch] = useState<string[]>([]);

  const handleContinue = async () => {

    if (equals(originalSeedPhrase, seedMatch)) {
      dispatch(clearSeedPhraseCache());
      history.push({
        pathname: "/dids",
      });
    }
  };

  useEffect(() => {
    if (originalSeedPhrase && originalSeedPhrase.length) {
      setSeedPhrase(shuffle(originalSeedPhrase));
    }
  }, []);

  const addSeedMatch = (word: string) => {
    setSeedMatch((seedMatch) => [...seedMatch, word]);

    const index = seedPhrase.indexOf(word);
    if (index > -1) {
      seedPhrase.splice(index, 1);
    }
    setSeedPhrase(seedPhrase);
  };

  const removeSeedMatch = (index: number) => {
    const removingQuantity = seedMatch.length - index;
    const newMatch = [...seedMatch];
    let words:string[] = [];

    for (let i = 0; i < removingQuantity; i++) {
      words = [...words, newMatch[newMatch.length -1]]
      newMatch.pop();
    }

    setSeedPhrase(seedPhrase.concat(words));
    setSeedMatch(newMatch);
  };

  return (
    <IonPage className="page-layout verify-seedphrase">
      <PageLayout
        backButton={true}
        backButtonPath={GENERATE_SEED_PHRASE_ROUTE}
        progressBar={true}
        progressBarValue={1}
        progressBarBuffer={1}
      >
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <h1>{i18n.t("verifyseedphrase.title")}</h1>
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
                  data-testid="seed-phrase-container"
                  className="seed-phrase-container"
                >
                  {seedMatch.map((word, index) => (
                    <IonChip key={index}
                      onClick={() => {
                        removeSeedMatch(index);
                      }}>
                      <span className="index">{index + 1}.</span>
                      <span>{word}</span>
                    </IonChip>
                  ))}
                  {seedPhrase.length ? <IonChip className="empty-word">
                    <span className="index">{seedMatch.length + 1}.</span>
                  </IonChip> : null}
                </div>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        {seedPhrase.length ?
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonCard className="container-bottom">
                  <div
                    data-testid="seed-phrase-container"
                    className="seed-phrase-container"
                  >
                    {seedPhrase.map((word, index) => (
                      <IonChip key={index} onClick={() => {
                        addSeedMatch(word);
                      }}>
                        <span>{word}</span>
                      </IonChip>
                    ))}
                  </div>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid> : null}
        <IonGrid className="footer">
          <IonRow>
            <IonCol>
              <IonButton
                shape="round"
                expand="block"
                className="ion-primary-button"
                data-testid="generate-seed-phrase-continue-button"
                onClick={() => handleContinue()}
                disabled={!equals(originalSeedPhrase, seedMatch)}
              >
                {i18n.t("generateseedphrase.continue.button")}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </PageLayout>
    </IonPage>
  );
};

export { VerifySeedPhrase };
