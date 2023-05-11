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
import "./VerifySeedPhrase.scss";
import { randomBytes } from "crypto";
import { hash, ArgonType } from "argon2-browser";
import {
  SecureStorage,
  KeyStoreKeys,
} from "../../../core/storage/secureStorage";
import { equals, shuffle } from "../../../utils/utils";
import { i18n } from "../../../i18n";
import { GENERATE_SEED_PHRASE_ROUTE } from "../../../routes";
import { PageLayout } from "../../components/layout/PageLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  clearSeedPhraseCache,
  getSeedPhraseCache,
} from "../../../store/reducers/SeedPhraseCache";
import Alert from "../../components/Alert/Alert";

const ARGON2ID_OPTIONS = {
  type: ArgonType.Argon2id,
  mem: 19456,
  time: 2,
  parallelism: 1,
  hashLen: 32,
};

const VerifySeedPhrase = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const originalSeedPhrase =
    useAppSelector(getSeedPhraseCache).seedPhrase.split(" ");
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [seedMatch, setSeedMatch] = useState<string[]>([]);
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  const handleContinue = async () => {
    if (equals(originalSeedPhrase, seedMatch)) {
      hash({
        pass: originalSeedPhrase.join(" "),
        salt: randomBytes(16),
        ...ARGON2ID_OPTIONS,
      }).then((hash) => {
        SecureStorage.set(KeyStoreKeys.APP_SEEDPHRASE, hash.encoded).then(
          () => {
            dispatch(clearSeedPhraseCache());
            history.push("/dids");
            return;
          }
        );
      });
    } else {
      setAlertIsOpen(true);
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
    let words: string[] = [];

    for (let i = 0; i < removingQuantity; i++) {
      words = [...words, newMatch[newMatch.length - 1]];
      newMatch.pop();
    }

    setSeedPhrase(seedPhrase.concat(words));
    setSeedMatch(newMatch);
  };

  return (
    <IonPage className="page-layout verify-seedphrase">
      <PageLayout
        header={true}
        backButton={true}
        backButtonPath={GENERATE_SEED_PHRASE_ROUTE}
        progressBar={true}
        progressBarValue={1}
        progressBarBuffer={1}
        footer={true}
        primaryButtonText={`${i18n.t("verifyseedphrase.continue.button")}`}
        primaryButtonAction={() => handleContinue()}
        primaryButtonDisabled={!(originalSeedPhrase.length == seedMatch.length)}
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
                  {seedMatch.map((word, index) => (
                    <IonChip
                      key={index}
                      onClick={() => {
                        removeSeedMatch(index);
                      }}
                    >
                      <span className="index">{index + 1}.</span>
                      <span>{word}</span>
                    </IonChip>
                  ))}
                  {seedPhrase.length ? (
                    <IonChip className="empty-word">
                      <span className="index">{seedMatch.length + 1}.</span>
                    </IonChip>
                  ) : null}
                </div>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        {seedPhrase.length ? (
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonCard className="container-bottom">
                  <div
                    data-testid="original-seed-phrase-container"
                    className="seed-phrase-container"
                  >
                    {seedPhrase.map((word, index) => (
                      <IonChip
                        key={index}
                        onClick={() => {
                          addSeedMatch(word);
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
