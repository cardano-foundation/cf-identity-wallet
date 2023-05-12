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
import { RoutePath } from "../../../routes";
import { PageLayout } from "../../components/layout/PageLayout";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import Alert from "../../components/Alert/Alert";
import {
  clearSeedPhraseCache,
  getSeedPhraseCache,
} from "../../../store/reducers/seedPhraseCache";
import { getNextRoute } from "../../../routes/nextRoute";
import { updateReduxState } from "../../../store/utils";
import { getState, setCurrentRoute } from "../../../store/reducers/stateCache";

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
  const storeState = useAppSelector(getState);
  const originalSeedPhrase =
    useAppSelector(getSeedPhraseCache).seedPhrase.split(" ");
  const [seedPhraseRemaining, setSeedPhraseRemaining] = useState<string[]>([]);
  const [seedPhraseSelected, setSeedPhraseSelected] = useState<string[]>([]);
  const [alertIsOpen, setAlertIsOpen] = useState(false);

  useEffect(() => {
    if (originalSeedPhrase && originalSeedPhrase.length) {
      setSeedPhraseRemaining(shuffle(originalSeedPhrase));
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
    if (equals(originalSeedPhrase, seedPhraseSelected)) {
      hash({
        pass: originalSeedPhrase.join(" "),
        salt: randomBytes(16),
        ...ARGON2ID_OPTIONS,
      }).then((hash) => {
        SecureStorage.set(KeyStoreKeys.APP_SEEDPHRASE, hash.encoded).then(
          () => {
            dispatch(clearSeedPhraseCache());
            const { nextPath, updateRedux } = getNextRoute(
              RoutePath.VERIFY_SEED_PHRASE,
              {
                store: storeState,
                state: { seedPhrase: seedPhraseRemaining.join(" ") },
              }
            );
            if (updateRedux?.length) updateReduxState(dispatch, updateRedux);
            dispatch(setCurrentRoute({ path: nextPath.pathname }));
            history.push(nextPath.pathname);
            return;
          }
        );
      });
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
